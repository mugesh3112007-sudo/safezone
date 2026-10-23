"""
Attendees router — anonymous check-in and session management.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.attendee import AttendeeSession
from app.models.event import Event
from app.models.zone import Zone

router = APIRouter(tags=["Attendees"])


# ── Pydantic schemas ───────────────────────────────────────────

class CheckInBody(BaseModel):
    zone: Optional[str] = None  # zone name or id for the entry gate


class ZoneUpdateBody(BaseModel):
    zone_id: str


class AttendeeOut(BaseModel):
    id: str
    event_id: str
    zone_id: Optional[str]
    session_token: str
    entry_zone: Optional[str]
    is_active: bool
    created_at: datetime
    last_ping: Optional[datetime]

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────

@router.post("/api/events/{event_id}/checkin", status_code=201)
def anonymous_checkin(event_id: str, body: CheckInBody, db: Session = Depends(get_db)):
    """Create a new anonymous attendee session. Returns a session token."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")

    # Resolve zone if provided
    zone_id: Optional[str] = None
    entry_zone: Optional[str] = None
    if body.zone:
        zone = (
            db.query(Zone)
            .filter(Zone.event_id == event_id)
            .filter((Zone.id == body.zone) | (Zone.name == body.zone))
            .first()
        )
        if zone:
            zone_id = zone.id
            entry_zone = zone.name
            # Increment zone count
            zone.current_count = zone.current_count + 1
            db.add(zone)

    session = AttendeeSession(
        id=str(uuid.uuid4()),
        event_id=event_id,
        zone_id=zone_id,
        entry_zone=entry_zone,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "session_token": session.session_token,
        "event_id": event_id,
        "entry_zone": entry_zone,
    }


@router.post("/api/attendees/{session_id}/zone", response_model=AttendeeOut)
def update_attendee_zone(session_id: str, body: ZoneUpdateBody, db: Session = Depends(get_db)):
    """Update which zone an attendee is currently in."""
    session = db.query(AttendeeSession).filter(AttendeeSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")

    # Decrement old zone count
    if session.zone_id:
        old_zone = db.query(Zone).filter(Zone.id == session.zone_id).first()
        if old_zone and old_zone.current_count > 0:
            old_zone.current_count -= 1
            db.add(old_zone)

    # Set new zone and increment
    new_zone = db.query(Zone).filter(Zone.id == body.zone_id).first()
    if not new_zone:
        raise HTTPException(404, "Zone not found")
    new_zone.current_count += 1
    db.add(new_zone)

    session.zone_id = body.zone_id
    session.last_ping = datetime.now(timezone.utc)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/api/attendees/{session_id}", response_model=AttendeeOut)
def get_attendee(session_id: str, db: Session = Depends(get_db)):
    session = db.query(AttendeeSession).filter(AttendeeSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    return session
