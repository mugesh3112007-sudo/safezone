"""IncidentLog model — completed/closed alert records for reporting."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text

from app.database import Base


class IncidentLog(Base):
    __tablename__ = "incident_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=False)
    guard_name = Column(String, nullable=False)
    zone_name = Column(String, nullable=False)
    alert_type = Column(String, nullable=False)
    status = Column(String, nullable=False)

    response_time_seconds = Column(Float, nullable=True)   # created → assigned
    resolution_time_seconds = Column(Float, nullable=True)  # created → resolved

    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
