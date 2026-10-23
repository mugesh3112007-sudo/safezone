"""
Dashboard router — KPIs, incident log, CSV export, crowd-warning trigger, QR codes.
"""

from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.zone import Zone
from app.models.alert import Alert
from app.models.attendee import AttendeeSession
from app.models.incident import IncidentLog
from app.services.heatmap_service import HeatmapService
from app.services.notification_service import NotificationService
from app.utils.qr_generator import generate_qr_bytes

router = APIRouter(tags=["Dashboard"])


# ── Pydantic schemas ───────────────────────────────────────────

class CrowdWarningBody(BaseModel):
    zone_id: str
    message: Optional[str] = None


# ── Dashboard KPI ──────────────────────────────────────────────

@router.get("/api/events/{event_id}/dashboard")
def dashboard_kpi(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")

    # Active attendees
    active_attendees = (
        db.query(func.count(AttendeeSession.id))
        .filter(AttendeeSession.event_id == event_id, AttendeeSession.is_active.is_(True))
        .scalar()
    ) or 0

    # Total scans (all attendee sessions)
    scan_count = (
        db.query(func.count(AttendeeSession.id))
        .filter(AttendeeSession.event_id == event_id)
        .scalar()
    ) or 0

    # Alerts
    total_alerts = (
        db.query(func.count(Alert.id)).filter(Alert.event_id == event_id).scalar()
    ) or 0
    false_alarms = (
        db.query(func.count(Alert.id))
        .filter(Alert.event_id == event_id, Alert.status == "false_alarm")
        .scalar()
    ) or 0

    false_alarm_rate = round(false_alarms / max(total_alerts, 1) * 100, 1)

    # Average response time (from incident logs)
    avg_resp = (
        db.query(func.avg(IncidentLog.response_time_seconds))
        .filter(IncidentLog.event_id == event_id, IncidentLog.response_time_seconds.isnot(None))
        .scalar()
    )
    avg_response_time = round(avg_resp, 1) if avg_resp else None

    # Zone densities
    zone_densities = HeatmapService.event_heatmap(db, event_id)

    return {
        "event_id": event_id,
        "event_name": event.name,
        "active_attendees": active_attendees,
        "scan_count": scan_count,
        "total_alerts": total_alerts,
        "false_alarms": false_alarms,
        "false_alarm_rate": false_alarm_rate,
        "avg_response_time_seconds": avg_response_time,
        "zone_densities": zone_densities,
    }


# ── Incident log ──────────────────────────────────────────────

@router.get("/api/events/{event_id}/incidents")
def list_incidents(
    event_id: str,
    status: Optional[str] = None,
    alert_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(IncidentLog).filter(IncidentLog.event_id == event_id)
    if status:
        q = q.filter(IncidentLog.status == status)
    if alert_type:
        q = q.filter(IncidentLog.alert_type == alert_type)
    incidents = q.order_by(IncidentLog.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "alert_id": i.alert_id,
            "guard_name": i.guard_name,
            "zone_name": i.zone_name,
            "alert_type": i.alert_type,
            "status": i.status,
            "response_time_seconds": i.response_time_seconds,
            "resolution_time_seconds": i.resolution_time_seconds,
            "created_at": i.created_at.isoformat() if i.created_at else None,
            "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None,
            "notes": i.notes,
        }
        for i in incidents
    ]


# ── CSV export ─────────────────────────────────────────────────

@router.get("/api/events/{event_id}/incidents/export")
def export_incidents_csv(event_id: str, db: Session = Depends(get_db)):
    incidents = (
        db.query(IncidentLog)
        .filter(IncidentLog.event_id == event_id)
        .order_by(IncidentLog.created_at.desc())
        .all()
    )

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "ID", "Alert ID", "Guard", "Zone", "Type", "Status",
        "Response Time (s)", "Resolution Time (s)", "Created At",
        "Resolved At", "Notes",
    ])
    for i in incidents:
        writer.writerow([
            i.id,
            i.alert_id,
            i.guard_name,
            i.zone_name,
            i.alert_type,
            i.status,
            i.response_time_seconds,
            i.resolution_time_seconds,
            i.created_at.isoformat() if i.created_at else "",
            i.resolved_at.isoformat() if i.resolved_at else "",
            i.notes or "",
        ])

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=incidents_{event_id[:8]}.csv"},
    )


# ── Crowd warning ─────────────────────────────────────────────

@router.post("/api/events/{event_id}/crowd-warning")
def send_crowd_warning(event_id: str, body: CrowdWarningBody, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == body.zone_id, Zone.event_id == event_id).first()
    if not zone:
        raise HTTPException(404, "Zone not found for this event")

    ratio = zone.current_count / max(zone.capacity, 1)
    msg = body.message or f"{zone.name} at {round(ratio * 100)}% capacity. Redirect crowd."

    NotificationService.send_whatsapp(
        to_name="Organizer",
        message=msg,
        zone_name=zone.name,
    )
    NotificationService.send_sms(
        to_name="All Guards",
        alert_id="crowd-warning",
        zone_name=zone.name,
        message=msg,
    )
    return {"detail": "Crowd warning sent", "zone": zone.name, "message": msg}


# ── Notifications poll ────────────────────────────────────────

@router.get("/api/notifications")
def recent_notifications(limit: int = 50):
    return NotificationService.get_recent(limit)


# ── QR Codes ───────────────────────────────────────────────────

@router.get("/api/events/{event_id}/qr/{zone_name}")
def qr_gate(event_id: str, zone_name: str):
    """Generate a QR code PNG for a gate / zone check-in URL."""
    png = generate_qr_bytes(event_id, zone_name, help_point=False)
    return Response(content=png, media_type="image/png")


@router.get("/api/events/{event_id}/qr/helppoint/{zone_name}")
def qr_helppoint(event_id: str, zone_name: str):
    """Generate a QR code PNG for a help-point URL."""
    png = generate_qr_bytes(event_id, zone_name, help_point=True)
    return Response(content=png, media_type="image/png")
