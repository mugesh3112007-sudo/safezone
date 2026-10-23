"""LocationPing model — periodic or alert-triggered location updates."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, DateTime, ForeignKey

from app.database import Base


class LocationPing(Base):
    __tablename__ = "location_pings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    attendee_id = Column(String, ForeignKey("attendee_sessions.id"), nullable=False)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=True)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    x = Column(Float, nullable=False, default=0.0)
    y = Column(Float, nullable=False, default=0.0)
    timestamp = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
