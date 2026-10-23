"""
Alerts router — create, query, and update alert lifecycle.
"""

from __future__ import annotations

import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.guard import Guard
from app.models.zone import Zone
from app.services.alert_service import AlertService
from app.routers.websocket import manager  # WebSocket broadcast

router = APIRouter(tags=["Alerts"])


# ── Pydantic schemas ───────────────────────────────────────────

class AlertCreate(BaseModel):
    session_token: str
    event_id: str
    zone_id: str
    alert_type: str  # sos / help_point / crowd_warning
    x: Optional[float] = None
    y: Optional[float] = None


class AlertStatusUpdate(BaseModel):
    status: str  # accepted / on_the_way / reached / resolved / false_alarm
    notes: Optional[str] = None


class AlertOut(BaseModel):
    id: str
    event_id: str
    attendee_id: str
    guard_id: Optional[str]
    zone_id: str
    alert_type: str
    status: str
    priority: int
    created_at: str
    assigned_at: Optional[str]
    reached_at: Optional[str]
    resolved_at: Optional[str]
    notes: Optional[str]
    # Enriched fields (filled manually)
    guard_name: Optional[str] = None
    zone_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Helpers ────────────────────────────────────────────────────

def _enrich(alert: Alert, db: Session) -> dict:
    """Build a dict with guard/zone names resolved."""
    data = {
        "id": alert.id,
        "event_id": alert.event_id,
        "attendee_id": alert.attendee_id,
        "guard_id": alert.guard_id,
        "zone_id": alert.zone_id,
        "alert_type": alert.alert_type,
        "status": alert.status,
        "priority": alert.priority,
        "created_at": alert.created_at.isoformat() if alert.created_at else None,
        "assigned_at": alert.assigned_at.isoformat() if alert.assigned_at else None,
        "reached_at": alert.reached_at.isoformat() if alert.reached_at else None,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
        "notes": alert.notes,
        "guard_name": None,
        "zone_name": None,
    }
    if alert.guard_id:
        guard = db.query(Guard).filter(Guard.id == alert.guard_id).first()
        if guard:
            data["guard_name"] = guard.name
    zone = db.query(Zone).filter(Zone.id == alert.zone_id).first()
    if zone:
        data["zone_name"] = zone.name
    return data


# ── Endpoints ──────────────────────────────────────────────────

@router.post("/api/alerts", status_code=201)
async def create_alert(body: AlertCreate, db: Session = Depends(get_db)):
    try:
        alert = AlertService.create_alert(
            db=db,
            event_id=body.event_id,
            session_token=body.session_token,
            zone_id=body.zone_id,
            alert_type=body.alert_type,
            x=body.x,
            y=body.y,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    enriched = _enrich(alert, db)

    # Broadcast via WebSocket to event channel
    await manager.broadcast_to_event(
        alert.event_id,
        json.dumps({"type": "new_alert", "alert": enriched}),
    )
    # Broadcast to alert-specific channel
    await manager.broadcast_to_alert(
        alert.id,
        json.dumps({"type": "alert_update", "alert": enriched}),
    )

    return enriched


@router.get("/api/alerts/{alert_id}")
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(404, "Alert not found")
    return _enrich(alert, db)


@router.put("/api/alerts/{alert_id}/status")
async def update_alert_status(
    alert_id: str, body: AlertStatusUpdate, db: Session = Depends(get_db)
):
    try:
        alert = AlertService.update_status(
            db=db,
            alert_id=alert_id,
            new_status=body.status,
            notes=body.notes,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    enriched = _enrich(alert, db)

    await manager.broadcast_to_event(
        alert.event_id,
        json.dumps({"type": "alert_update", "alert": enriched}),
    )
    await manager.broadcast_to_alert(
        alert.id,
        json.dumps({"type": "alert_update", "alert": enriched}),
    )

    return enriched


@router.get("/api/events/{event_id}/alerts")
def list_alerts(
    event_id: str,
    status: Optional[str] = None,
    zone_id: Optional[str] = None,
    alert_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Alert).filter(Alert.event_id == event_id)
    if status:
        q = q.filter(Alert.status == status)
    if zone_id:
        q = q.filter(Alert.zone_id == zone_id)
    if alert_type:
        q = q.filter(Alert.alert_type == alert_type)
    alerts = q.order_by(Alert.created_at.desc()).all()
    return [_enrich(a, db) for a in alerts]


@router.get("/api/events/{event_id}/alerts/active")
def active_alerts(event_id: str, db: Session = Depends(get_db)):
    active_statuses = ("sent", "assigned", "on_the_way", "reached")
    alerts = (
        db.query(Alert)
        .filter(Alert.event_id == event_id, Alert.status.in_(active_statuses))
        .order_by(Alert.priority, Alert.created_at)
        .all()
    )
    return [_enrich(a, db) for a in alerts]
