"""
Seed data for SafeZone — populates one demo event with zones, guards.

Runnable standalone:
    cd backend && python -m seeds.seed_data

Also called from app.main on first startup when the DB is empty.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.zone import Zone
from app.models.guard import Guard


# ── Fixed UUIDs (stable across re-seeds) ──────────────────────

EVENT_ID = "e0000000-0000-4000-a000-000000000001"

ZONE_IDS = {
    "Gate 1":            "z0000000-0000-4000-a000-000000000001",
    "Main Stage":        "z0000000-0000-4000-a000-000000000002",
    "Food Court":        "z0000000-0000-4000-a000-000000000003",
    "Restroom Block A":  "z0000000-0000-4000-a000-000000000004",
    "Parking":           "z0000000-0000-4000-a000-000000000005",
    "Workshop Hall":     "z0000000-0000-4000-a000-000000000006",
}

GUARD_IDS = {
    "Ravi":    "g0000000-0000-4000-a000-000000000001",
    "Priya":   "g0000000-0000-4000-a000-000000000002",
    "Karthik": "g0000000-0000-4000-a000-000000000003",
    "Meena":   "g0000000-0000-4000-a000-000000000004",
    "Arjun":   "g0000000-0000-4000-a000-000000000005",
}


# ── Seed function ─────────────────────────────────────────────

def seed(db: Session) -> None:
    """Insert demo event, zones, and guards.  Idempotent — skips if event exists."""

    existing = db.query(Event).filter(Event.id == EVENT_ID).first()
    if existing:
        print("[seed] Event already exists — skipping.")
        return

    # ── Event ──────────────────────────────────────────────

    event = Event(
        id=EVENT_ID,
        name="Dexathon Fest 2026",
        description="Annual tech & cultural fest — safety monitoring demo.",
        date=datetime(2026, 10, 25, 9, 0, 0, tzinfo=timezone.utc),
        status="active",
    )
    db.add(event)

    # ── Zones ──────────────────────────────────────────────

    zones_data = [
        {
            "id": ZONE_IDS["Gate 1"],
            "name": "Gate 1",
            "zone_type": "gate",
            "capacity": 500,
            "x": 50, "y": 300, "width": 100, "height": 80,
            "color": "#3498DB",
            "help_point": False,
        },
        {
            "id": ZONE_IDS["Main Stage"],
            "name": "Main Stage",
            "zone_type": "stage",
            "capacity": 2000,
            "x": 400, "y": 100, "width": 250, "height": 200,
            "color": "#E74C3C",
            "help_point": False,
        },
        {
            "id": ZONE_IDS["Food Court"],
            "name": "Food Court",
            "zone_type": "food",
            "capacity": 800,
            "x": 750, "y": 100, "width": 200, "height": 150,
            "color": "#F39C12",
            "help_point": False,
        },
        {
            "id": ZONE_IDS["Restroom Block A"],
            "name": "Restroom Block A",
            "zone_type": "restroom",
            "capacity": 100,
            "x": 750, "y": 400, "width": 150, "height": 100,
            "color": "#9B59B6",
            "help_point": True,
        },
        {
            "id": ZONE_IDS["Parking"],
            "name": "Parking",
            "zone_type": "parking",
            "capacity": 300,
            "x": 50, "y": 500, "width": 200, "height": 80,
            "color": "#1ABC9C",
            "help_point": False,
        },
        {
            "id": ZONE_IDS["Workshop Hall"],
            "name": "Workshop Hall",
            "zone_type": "other",
            "capacity": 500,
            "x": 400, "y": 400, "width": 200, "height": 150,
            "color": "#2ECC71",
            "help_point": False,
        },
    ]

    for zd in zones_data:
        db.add(Zone(event_id=EVENT_ID, **zd))

    # ── Guards ─────────────────────────────────────────────

    guards_data = [
        {
            "id": GUARD_IDS["Ravi"],
            "name": "Ravi",
            "pin": "1234",
            "zone_id": ZONE_IDS["Gate 1"],
            "x": 80, "y": 320,
        },
        {
            "id": GUARD_IDS["Priya"],
            "name": "Priya",
            "pin": "2345",
            "zone_id": ZONE_IDS["Main Stage"],
            "x": 480, "y": 180,
        },
        {
            "id": GUARD_IDS["Karthik"],
            "name": "Karthik",
            "pin": "3456",
            "zone_id": ZONE_IDS["Food Court"],
            "x": 810, "y": 160,
        },
        {
            "id": GUARD_IDS["Meena"],
            "name": "Meena",
            "pin": "4567",
            "zone_id": ZONE_IDS["Restroom Block A"],
            "x": 800, "y": 430,
        },
        {
            "id": GUARD_IDS["Arjun"],
            "name": "Arjun",
            "pin": "5678",
            "zone_id": ZONE_IDS["Parking"],
            "x": 120, "y": 520,
        },
    ]

    for gd in guards_data:
        db.add(Guard(event_id=EVENT_ID, **gd))

    db.commit()
    print(f"[seed] Created event '{event.name}' with {len(zones_data)} zones and {len(guards_data)} guards.")


# ── Standalone entry-point ─────────────────────────────────────

if __name__ == "__main__":
    import sys
    import os

    # Ensure the package root is on sys.path when run as `python -m seeds.seed_data`
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from app.database import engine, Base, SessionLocal

    # Import all models so tables are registered
    from app.models import Event, Zone, AttendeeSession, Guard, Alert, LocationPing, IncidentLog  # noqa: F401

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
