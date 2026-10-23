"""
AssignmentService — auto-assign the nearest available guard to an alert.

Strategy:
1. Fetch all guards for the event whose status is "available".
2. Compute Euclidean distance from the alert's zone centre to each guard's (x, y).
3. Pick the closest guard.
4. Mark the guard as "busy", stamp assigned_at on the alert, link guard_id.
5. Send a mock notification and broadcast via WebSocket.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.guard import Guard
from app.models.alert import Alert
from app.models.zone import Zone
from app.services.notification_service import NotificationService


class AssignmentService:
    """All methods are static; no instances required."""

    @staticmethod
    def assign_nearest_guard(
        db: Session,
        alert: Alert,
    ) -> Optional[Guard]:
        """
        Find and assign the nearest available guard for *alert*.
        Returns the Guard ORM object or None if nobody is available.
        """
        # Zone centre — used as the alert location
        zone: Optional[Zone] = db.query(Zone).filter(Zone.id == alert.zone_id).first()
        if zone is None:
            return None
        alert_x = zone.x + zone.width / 2
        alert_y = zone.y + zone.height / 2

        # Available guards for this event
        guards = (
            db.query(Guard)
            .filter(Guard.event_id == alert.event_id, Guard.status == "available")
            .all()
        )
        if not guards:
            return None

        # Pick closest by Euclidean distance
        def _dist(g: Guard) -> float:
            return math.hypot(g.x - alert_x, g.y - alert_y)

        nearest = min(guards, key=_dist)

        # Assign
        now = datetime.now(timezone.utc)
        alert.guard_id = nearest.id
        alert.status = "assigned"
        alert.assigned_at = now
        nearest.status = "busy"

        db.add(alert)
        db.add(nearest)
        db.commit()
        db.refresh(alert)
        db.refresh(nearest)

        # Mock notification
        zone_name = zone.name if zone else "Unknown"
        _type_label = {
            "sos": "SOS alert from attendee. Proceed immediately.",
            "help_point": "Help-point request. Please assist.",
            "crowd_warning": "Crowd density warning. Monitor and redirect.",
        }
        NotificationService.send_sms(
            to_name=nearest.name,
            alert_id=alert.id,
            zone_name=zone_name,
            message=_type_label.get(alert.alert_type, "New alert."),
        )

        return nearest
