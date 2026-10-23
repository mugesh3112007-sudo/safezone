"""Guard model — security personnel assigned to an event."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, ForeignKey, DateTime

from app.database import Base


class Guard(Base):
    __tablename__ = "guards"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    name = Column(String, nullable=False)
    pin = Column(String, nullable=False)  # 4-digit PIN
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    status = Column(String, nullable=False, default="available")  # available / busy / offline

    # Simulated position on venue map
    x = Column(Float, nullable=False, default=0.0)
    y = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
