"""
Events router — CRUD for events.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.zone import Zone
from app.models.attendee import AttendeeSession
from app.models.guard import Guard
from app.models.alert import Alert
from app.models.location import LocationPing
from app.models.incident import IncidentLog

router = APIRouter(prefix="/api/events", tags=["Events"])


# ── Pydantic schemas ───────────────────────────────────────────

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: datetime
    status: str = "setup"


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    status: Optional[str] = None


class EventOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    date: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────

@router.post("", response_model=EventOut, status_code=201)
def create_event(body: EventCreate, db: Session = Depends(get_db)):
    event = Event(
        id=str(uuid.uuid4()),
        name=body.name,
        description=body.description,
        date=body.date,
        status=body.status,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.date.desc()).all()


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    return event


@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: str, body: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}/data", status_code=200)
def delete_event_data(event_id: str, db: Session = Depends(get_db)):
    """Delete ALL data belonging to an event (privacy purge)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")

    # Delete in dependency order
    # LocationPings via attendee sessions
    attendee_ids = [
        a.id
        for a in db.query(AttendeeSession).filter(AttendeeSession.event_id == event_id).all()
    ]
    if attendee_ids:
        db.query(LocationPing).filter(LocationPing.attendee_id.in_(attendee_ids)).delete(
            synchronize_session=False
        )

    db.query(IncidentLog).filter(IncidentLog.event_id == event_id).delete(synchronize_session=False)
    db.query(Alert).filter(Alert.event_id == event_id).delete(synchronize_session=False)
    db.query(Guard).filter(Guard.event_id == event_id).delete(synchronize_session=False)
    db.query(AttendeeSession).filter(AttendeeSession.event_id == event_id).delete(
        synchronize_session=False
    )
    db.query(Zone).filter(Zone.event_id == event_id).delete(synchronize_session=False)
    db.delete(event)
    db.commit()
    return {"detail": f"All data for event {event_id} deleted."}
