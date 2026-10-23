"""
HeatmapService — zone density calculations, colour coding, and
automatic crowd-warning generation.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.zone import Zone
from app.models.event import Event
from app.services.notification_service import NotificationService


class HeatmapService:
    """Static utilities for crowd-density analysis."""

    # ── colour thresholds ───────────────────────────────────────
    # green  < 60 %
    # amber  60 – 85 %
    # red    > 85 %

    @staticmethod
    def density_color(ratio: float) -> str:
        if ratio > 0.85:
            return "red"
        if ratio >= 0.60:
            return "amber"
        return "green"

    @staticmethod
    def zone_density(zone: Zone) -> dict:
        """Return a density snapshot dict for a single zone."""
        ratio = zone.current_count / max(zone.capacity, 1)
        return {
            "zone_id": zone.id,
            "zone_name": zone.name,
            "zone_type": zone.zone_type,
            "capacity": zone.capacity,
            "current_count": zone.current_count,
            "density_pct": round(ratio * 100, 1),
            "color": HeatmapService.density_color(ratio),
            "x": zone.x,
            "y": zone.y,
            "width": zone.width,
            "height": zone.height,
            "hex_color": zone.color,
        }

    @staticmethod
    def event_heatmap(db: Session, event_id: str) -> list[dict]:
        """Return density data for every zone in an event."""
        zones = db.query(Zone).filter(Zone.event_id == event_id).all()
        return [HeatmapService.zone_density(z) for z in zones]

    @staticmethod
    def check_thresholds(db: Session, event_id: str) -> list[dict]:
        """
        Check each zone against its threshold_pct.
        Returns a list of zones that are over threshold (for auto crowd-warnings).
        """
        zones = db.query(Zone).filter(Zone.event_id == event_id).all()
        warnings: list[dict] = []
        for z in zones:
            ratio = z.current_count / max(z.capacity, 1)
            if ratio >= z.threshold_pct:
                warnings.append(HeatmapService.zone_density(z))
                # Notify organiser
                event: Optional[Event] = db.query(Event).filter(Event.id == event_id).first()
                event_name = event.name if event else event_id
                NotificationService.send_whatsapp(
                    to_name="Organizer",
                    message=f"{z.name} at {round(ratio * 100)}% capacity. Redirect crowd.",
                    zone_name=z.name,
                )
        return warnings
