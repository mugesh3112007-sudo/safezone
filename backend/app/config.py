"""
SafeZone — Application Configuration
"""

# Database
DATABASE_URL = "sqlite:///./safezone.db"

# Frontend (CORS origin)
FRONTEND_URL = "http://localhost:5173"

# Admin credentials (MVP — no user table, simple check)
ADMIN_EMAIL = "organizer@demo.com"
ADMIN_PASSWORD = "admin123"

# WebSocket heatmap broadcast interval (seconds)
HEATMAP_INTERVAL = 2.0
