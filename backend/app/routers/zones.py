"""
Zones router — manage venue zones within an event.
"""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.zone import Zone
from app.models.event import Event
from app.services.heatmap_service import HeatmapService

router = APIRouter(tags=["Zones"])


# ── Pydantic schemas ───────────────────────────────────────────

class ZoneCreate(BaseModel):
    name: str
    zone_type: str = "other"
    capacity: int = 100
    threshold_pct: float = 0.85
    x: float = 0.0
    y: float = 0.0
    width: float = 100.0
    height: float = 80.0
    help_point: bool = False
    color: str = "#4A90D9"


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    zone_type: Optional[str] = None
    capacity: Optional[int] = None
    current_count: Optional[int] = None
    threshold_pct: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    help_point: Optional[bool] = None
    color: Optional[str] = None


class ZoneOut(BaseModel):
    id: str
    event_id: str
    name: str
    zone_type: str
    capacity: int
    current_count: int
    threshold_pct: float
    x: float
    y: float
    width: float
    height: float
    help_point: bool
    color: str

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────

@router.post("/api/events/{event_id}/zones", response_model=ZoneOut, status_code=201)
def create_zone(event_id: str, body: ZoneCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")

    zone = Zone(
        id=str(uuid.uuid4()),
        event_id=event_id,
        name=body.name,
        zone_type=body.zone_type,
        capacity=body.capacity,
        threshold_pct=body.threshold_pct,
        x=body.x,
        y=body.y,
        width=body.width,
        height=body.height,
        help_point=body.help_point,
        color=body.color,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.get("/api/events/{event_id}/zones", response_model=list[ZoneOut])
def list_zones(event_id: str, db: Session = Depends(get_db)):
    return db.query(Zone).filter(Zone.event_id == event_id).all()


@router.put("/api/zones/{zone_id}", response_model=ZoneOut)
def update_zone(zone_id: str, body: ZoneUpdate, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(404, "Zone not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    db.commit()
    db.refresh(zone)
    return zone


@router.get("/api/zones/{zone_id}/density")
def zone_density(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(404, "Zone not found")
    return HeatmapService.zone_density(zone)
