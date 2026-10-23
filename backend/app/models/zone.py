"""Zone model — a named area inside a venue (gate, stage, food court, etc.)."""

import uuid

from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey

from app.database import Base


class Zone(Base):
    __tablename__ = "zones"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    name = Column(String, nullable=False)
    zone_type = Column(String, nullable=False)  # gate / stage / food / restroom / parking / other
    capacity = Column(Integer, nullable=False)
    current_count = Column(Integer, nullable=False, default=0)
    threshold_pct = Column(Float, nullable=False, default=0.85)

    # Position & size on the venue map (1000×600 canvas)
    x = Column(Float, nullable=False, default=0.0)
    y = Column(Float, nullable=False, default=0.0)
    width = Column(Float, nullable=False, default=100.0)
    height = Column(Float, nullable=False, default=80.0)

    help_point = Column(Boolean, nullable=False, default=False)
    color = Column(String, nullable=False, default="#4A90D9")  # hex colour for map display
