"""
WebSocket router and ConnectionManager for real-time updates.

Channels:
  /ws/alerts/{event_id}       — alert feed for guards / organizers
  /ws/heatmap/{event_id}      — zone density updates (broadcast every 2 s)
  /ws/alert-status/{alert_id} — single-alert updates (attendee watches)
"""

from __future__ import annotations

import asyncio
import json
from typing import Dict, List, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.database import SessionLocal
from app.services.heatmap_service import HeatmapService

router = APIRouter(tags=["WebSocket"])


# ───────────────────────────────────────────────────────────────
# Connection Manager
# ───────────────────────────────────────────────────────────────

class ConnectionManager:
    """Manages WebSocket connections grouped by channel key."""

    def __init__(self) -> None:
        # event_id -> set of websockets  (alerts + heatmap share the event key)
        self.event_connections: Dict[str, List[WebSocket]] = {}
        # alert_id -> set of websockets
        self.alert_connections: Dict[str, List[WebSocket]] = {}
        # event_ids that have at least one heatmap subscriber
        self.heatmap_connections: Dict[str, List[WebSocket]] = {}

    # ── connect / disconnect ─────────────────────────────────

    def _add(self, store: Dict[str, List[WebSocket]], key: str, ws: WebSocket) -> None:
        store.setdefault(key, []).append(ws)

    def _remove(self, store: Dict[str, List[WebSocket]], key: str, ws: WebSocket) -> None:
        conns = store.get(key, [])
        if ws in conns:
            conns.remove(ws)
        if not conns:
            store.pop(key, None)

    async def connect_event(self, event_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._add(self.event_connections, event_id, ws)

    def disconnect_event(self, event_id: str, ws: WebSocket) -> None:
        self._remove(self.event_connections, event_id, ws)

    async def connect_heatmap(self, event_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._add(self.heatmap_connections, event_id, ws)

    def disconnect_heatmap(self, event_id: str, ws: WebSocket) -> None:
        self._remove(self.heatmap_connections, event_id, ws)

    async def connect_alert(self, alert_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._add(self.alert_connections, alert_id, ws)

    def disconnect_alert(self, alert_id: str, ws: WebSocket) -> None:
        self._remove(self.alert_connections, alert_id, ws)

    # ── broadcast helpers ────────────────────────────────────

    async def _broadcast(self, conns: List[WebSocket], message: str) -> None:
        disconnected: List[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_text(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            if ws in conns:
                conns.remove(ws)

    async def broadcast_to_event(self, event_id: str, message: str) -> None:
        conns = self.event_connections.get(event_id, [])
        await self._broadcast(conns, message)

    async def broadcast_to_alert(self, alert_id: str, message: str) -> None:
        conns = self.alert_connections.get(alert_id, [])
        await self._broadcast(conns, message)

    async def broadcast_heatmap(self, event_id: str, message: str) -> None:
        conns = self.heatmap_connections.get(event_id, [])
        await self._broadcast(conns, message)


# Singleton — imported by other routers for broadcasting
manager = ConnectionManager()


# ───────────────────────────────────────────────────────────────
# WebSocket endpoints
# ───────────────────────────────────────────────────────────────

@router.websocket("/ws/alerts/{event_id}")
async def ws_alerts(websocket: WebSocket, event_id: str):
    await manager.connect_event(event_id, websocket)
    try:
        while True:
            # Keep connection alive; ignore incoming messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_event(event_id, websocket)


@router.websocket("/ws/heatmap/{event_id}")
async def ws_heatmap(websocket: WebSocket, event_id: str):
    await manager.connect_heatmap(event_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_heatmap(event_id, websocket)


@router.websocket("/ws/alert-status/{alert_id}")
async def ws_alert_status(websocket: WebSocket, alert_id: str):
    await manager.connect_alert(alert_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_alert(alert_id, websocket)


# ───────────────────────────────────────────────────────────────
# Background heatmap broadcaster (started from main.py lifespan)
# ───────────────────────────────────────────────────────────────

async def heatmap_broadcast_loop(interval: float = 2.0) -> None:
    """
    Periodically push zone density data to all heatmap subscribers.
    Runs as a background asyncio task.
    """
    while True:
        await asyncio.sleep(interval)
        # Iterate over a snapshot of event_ids with heatmap subscribers
        event_ids = list(manager.heatmap_connections.keys())
        if not event_ids:
            continue
        db = SessionLocal()
        try:
            for eid in event_ids:
                data = HeatmapService.event_heatmap(db, eid)
                msg = json.dumps({"type": "heatmap", "zones": data})
                await manager.broadcast_heatmap(eid, msg)
        finally:
            db.close()
