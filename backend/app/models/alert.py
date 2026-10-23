"""Alert model — SOS / help-point / crowd-warning alerts."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text

from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    attendee_id = Column(String, ForeignKey("attendee_sessions.id"), nullable=False)
    guard_id = Column(String, ForeignKey("guards.id"), nullable=True)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=False)

    alert_type = Column(String, nullable=False)  # sos / help_point / crowd_warning
    status = Column(String, nullable=False, default="sent")
    # sent -> assigned -> on_the_way -> reached -> resolved | false_alarm
    priority = Column(Integer, nullable=False, default=3)  # 1=SOS, 2=help_point, 3=crowd_warning

    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    assigned_at = Column(DateTime, nullable=True)
    reached_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
