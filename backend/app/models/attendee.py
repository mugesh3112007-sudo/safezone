"""AttendeeSession model — anonymous check-in session for an attendee."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey

from app.database import Base


class AttendeeSession(Base):
    __tablename__ = "attendee_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    session_token = Column(String, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    entry_zone = Column(String, nullable=True)  # which gate they entered through
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    last_ping = Column(DateTime, nullable=True)
