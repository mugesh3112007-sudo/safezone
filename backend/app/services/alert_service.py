"""
AlertService — higher-level alert workflow (create, update status, close).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.attendee import AttendeeSession
from app.models.guard import Guard
from app.models.zone import Zone
from app.models.location import LocationPing
from app.models.incident import IncidentLog
from app.services.assignment_service import AssignmentService
from app.services.notification_service import NotificationService


# Priority map
_PRIORITY = {"sos": 1, "help_point": 2, "crowd_warning": 3}


class AlertService:
    """Alert lifecycle management."""

    @staticmethod
    def create_alert(
        db: Session,
        event_id: str,
        session_token: str,
        zone_id: str,
        alert_type: str,
        x: Optional[float] = None,
        y: Optional[float] = None,
    ) -> Alert:
        """
        Create a new alert, auto-assign a guard, optionally record a
        location ping, and return the persisted Alert.
        """
        attendee = (
            db.query(AttendeeSession)
            .filter(AttendeeSession.session_token == session_token)
            .first()
        )
        if attendee is None:
            raise ValueError("Invalid session token")

        alert = Alert(
            id=str(uuid.uuid4()),
            event_id=event_id,
            attendee_id=attendee.id,
            zone_id=zone_id,
            alert_type=alert_type,
            priority=_PRIORITY.get(alert_type, 3),
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        # Optional location ping
        if x is not None and y is not None:
            ping = LocationPing(
                id=str(uuid.uuid4()),
                attendee_id=attendee.id,
                alert_id=alert.id,
                zone_id=zone_id,
                x=x,
                y=y,
            )
            db.add(ping)
            db.commit()

        # Auto-assign nearest guard
        AssignmentService.assign_nearest_guard(db, alert)
        db.refresh(alert)

        return alert

    @staticmethod
    def update_status(
        db: Session,
        alert_id: str,
        new_status: str,
        notes: Optional[str] = None,
    ) -> Alert:
        """
        Transition an alert's status. On terminal statuses (resolved /
        false_alarm) create an IncidentLog and free the guard.
        """
        alert: Optional[Alert] = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert is None:
            raise ValueError("Alert not found")

        now = datetime.now(timezone.utc)
        alert.status = new_status

        if new_status == "on_the_way":
            pass  # no special timestamp
        elif new_status == "reached":
            alert.reached_at = now
        elif new_status in ("resolved", "false_alarm"):
            alert.resolved_at = now
            if notes:
                alert.notes = notes

            # Free the guard
            if alert.guard_id:
                guard: Optional[Guard] = db.query(Guard).filter(Guard.id == alert.guard_id).first()
                if guard:
                    guard.status = "available"
                    db.add(guard)

            # Create incident log
            AlertService._create_incident(db, alert)

        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    # ── internal ────────────────────────────────────────────────

    @staticmethod
    def _create_incident(db: Session, alert: Alert) -> IncidentLog:
        guard_name = "Unassigned"
        if alert.guard_id:
            guard = db.query(Guard).filter(Guard.id == alert.guard_id).first()
            if guard:
                guard_name = guard.name

        zone_name = "Unknown"
        zone = db.query(Zone).filter(Zone.id == alert.zone_id).first()
        if zone:
            zone_name = zone.name

        response_time = None
        if alert.assigned_at and alert.created_at:
            response_time = (alert.assigned_at - alert.created_at).total_seconds()

        resolution_time = None
        if alert.resolved_at and alert.created_at:
            resolution_time = (alert.resolved_at - alert.created_at).total_seconds()

        incident = IncidentLog(
            id=str(uuid.uuid4()),
            event_id=alert.event_id,
            alert_id=alert.id,
            guard_name=guard_name,
            zone_name=zone_name,
            alert_type=alert.alert_type,
            status=alert.status,
            response_time_seconds=response_time,
            resolution_time_seconds=resolution_time,
            resolved_at=alert.resolved_at,
            notes=alert.notes,
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident
