"""Event model — represents a single event/fest."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Text

from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="setup")  # active / completed / setup
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
