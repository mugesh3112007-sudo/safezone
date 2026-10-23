"""
SafeZone — FastAPI application entry-point.

Run with:
    cd backend && uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL
from app.database import engine, Base, SessionLocal

# Import all models so Base.metadata knows about every table
from app.models import (  # noqa: F401
    Event, Zone, AttendeeSession, Guard, Alert, LocationPing, IncidentLog,
)

from app.routers.events import router as events_router
from app.routers.zones import router as zones_router
from app.routers.attendees import router as attendees_router
from app.routers.guards import router as guards_router
from app.routers.alerts import router as alerts_router
from app.routers.dashboard import router as dashboard_router
from app.routers.websocket import router as websocket_router, heatmap_broadcast_loop
from app.config import HEATMAP_INTERVAL


# ── Lifespan (startup / shutdown) ─────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Auto-seed if the DB is empty (no events yet)
    db = SessionLocal()
    try:
        from app.models.event import Event as Ev
        if db.query(Ev).count() == 0:
            print("[SafeZone] Empty database detected — running seed …")
            from seeds.seed_data import seed
            seed(db)
            print("[SafeZone] Seed data loaded.")
    finally:
        db.close()

    # Start background heatmap broadcaster
    heatmap_task = asyncio.create_task(heatmap_broadcast_loop(HEATMAP_INTERVAL))

    yield  # ← app is running

    # --- Shutdown ---
    heatmap_task.cancel()
    try:
        await heatmap_task
    except asyncio.CancelledError:
        pass


# ── App instance ───────────────────────────────────────────────

app = FastAPI(
    title="SafeZone API",
    description="Event safety management backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(events_router)
app.include_router(zones_router)
app.include_router(attendees_router)
app.include_router(guards_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)
app.include_router(websocket_router)


# ── Health check ───────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "safezone-backend"}
