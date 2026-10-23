"""
Guards router — manage security guards for an event.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.guard import Guard
from app.models.event import Event

router = APIRouter(tags=["Guards"])


# ── Pydantic schemas ───────────────────────────────────────────

class GuardCreate(BaseModel):
    name: str
    pin: str  # 4-digit
    zone_id: Optional[str] = None
    x: float = 0.0
    y: float = 0.0


class GuardLogin(BaseModel):
    event_id: str
    pin: str


class GuardStatusUpdate(BaseModel):
    status: str  # available / busy / offline


class GuardPositionUpdate(BaseModel):
    x: float
    y: float


class GuardOut(BaseModel):
    id: str
    event_id: str
    name: str
    pin: str
    zone_id: Optional[str]
    status: str
    x: float
    y: float
    created_at: datetime

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────

@router.post("/api/events/{event_id}/guards", response_model=GuardOut, status_code=201)
def create_guard(event_id: str, body: GuardCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")

    guard = Guard(
        id=str(uuid.uuid4()),
        event_id=event_id,
        name=body.name,
        pin=body.pin,
        zone_id=body.zone_id,
        x=body.x,
        y=body.y,
    )
    db.add(guard)
    db.commit()
    db.refresh(guard)
    return guard


@router.get("/api/events/{event_id}/guards", response_model=list[GuardOut])
def list_guards(event_id: str, db: Session = Depends(get_db)):
    return db.query(Guard).filter(Guard.event_id == event_id).all()


@router.post("/api/guards/login", response_model=GuardOut)
def guard_login(body: GuardLogin, db: Session = Depends(get_db)):
    guard = (
        db.query(Guard)
        .filter(Guard.event_id == body.event_id, Guard.pin == body.pin)
        .first()
    )
    if not guard:
        raise HTTPException(401, "Invalid event or PIN")
    # Mark as available on login
    guard.status = "available"
    db.commit()
    db.refresh(guard)
    return guard


@router.put("/api/guards/{guard_id}/status", response_model=GuardOut)
def update_guard_status(guard_id: str, body: GuardStatusUpdate, db: Session = Depends(get_db)):
    guard = db.query(Guard).filter(Guard.id == guard_id).first()
    if not guard:
        raise HTTPException(404, "Guard not found")
    guard.status = body.status
    db.commit()
    db.refresh(guard)
    return guard


@router.put("/api/guards/{guard_id}/position", response_model=GuardOut)
def update_guard_position(guard_id: str, body: GuardPositionUpdate, db: Session = Depends(get_db)):
    guard = db.query(Guard).filter(Guard.id == guard_id).first()
    if not guard:
        raise HTTPException(404, "Guard not found")
    guard.x = body.x
    guard.y = body.y
    db.commit()
    db.refresh(guard)
    return guard
