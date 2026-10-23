from app.routers.events import router as events_router
from app.routers.zones import router as zones_router
from app.routers.attendees import router as attendees_router
from app.routers.guards import router as guards_router
from app.routers.alerts import router as alerts_router
from app.routers.dashboard import router as dashboard_router
from app.routers.websocket import router as websocket_router

__all__ = [
    "events_router",
    "zones_router",
    "attendees_router",
    "guards_router",
    "alerts_router",
    "dashboard_router",
    "websocket_router",
]
