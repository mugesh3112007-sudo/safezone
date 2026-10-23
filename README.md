# 🛡️ SafeZone

> **Free for attendees. Paid for by the events they protect.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**SafeZone** is an event safety web app — attendees scan one QR code at the event gate and get a safety companion in their browser. Two layers in one scan:

1. **🆘 Silent Personal SOS** — alerts the nearest on-site security guard within seconds
2. **📊 Live Crowd-Density Heatmap** — helps organizers manage crowd safety in real time

No app install. No sign-up. No location tracking (until you need help). Works on any phone with a browser.

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Attendee   │     │  Guard /    │     │  Organizer   │
│  (Mobile)   │     │  Responder  │     │  Dashboard   │
│  PWA        │     │  (Mobile)   │     │  (Desktop)   │
└──────┬──────┘     └──────┬──────┘     └──────┬───────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    WebSocket + REST
                           │
                   ┌───────┴───────┐
                   │   FastAPI     │
                   │   Backend     │
                   ├───────────────┤
                   │  SQLite /     │
                   │  PostgreSQL   │
                   └───────────────┘
```

**Key design decisions:**
- **No app install** — pure web (PWA), works on any device
- **No login for attendees** — QR scan → session token (cookie-based)
- **Location only during alerts** — no ambient tracking, privacy by default
- **WebSocket for real-time** — guard alerts, heatmap updates, crowd warnings
- **SQLite for hackathon** — swappable to PostgreSQL for production

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite) + Tailwind CSS |
| **Maps** | Leaflet.js with custom zone overlays |
| **State** | Zustand (lightweight, no boilerplate) |
| **Backend** | Python FastAPI + SQLAlchemy |
| **Real-time** | WebSockets (native FastAPI) |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Auth** | Session tokens (attendees), PIN (guards), email/pass (organizers) |

**No paid services required.** No Firebase, no AWS, no Twilio. Everything runs locally.

---

## Quick Start

```bash
git clone https://github.com/your-team/safezone.git
cd safezone
./start.sh
```

This single command:
1. Creates a Python virtual environment and installs backend dependencies
2. Seeds the database with demo data (Dexathon Fest 2026)
3. Starts the FastAPI backend on `:8000`
4. Installs npm packages and starts the React frontend on `:5173`

---

## Manual Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Seed demo data
python -m seeds.seed_data

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

---

## Demo Script (3-Minute Pitch)

Follow this sequence for a smooth hackathon demo:

### 1. Attendee Flow (60s)
1. Open `http://localhost:5173/demo` on your phone (or use the QR code)
2. Show the landing page — "Your Safety Companion"
3. Tap "I consent" → enter the event
4. Show the calm home screen — explain the hidden SOS triggers:
   - **Long press** the SOS button (3 seconds)
   - **Rapid tap** 5 times anywhere
   - **Voice trigger** — say "pineapple" (discreet safe word)
5. Trigger an SOS → watch the 5-second safety check countdown
6. Don't cancel → see "Help is on the way" with guard assignment + ETA

### 2. Guard Flow (45s)
7. Open `http://localhost:5173/guard/login` on another device
8. Log in with PIN `1234` (Guard: Ravi Kumar)
9. Watch the alert appear in real-time — show the vibration + sound
10. Accept the alert → navigate to the attendee
11. Update status: "En route" → "On scene" → "Resolved"

### 3. Organizer Dashboard (45s)
12. Open `http://localhost:5173/org/login` on a laptop
13. Log in: `organizer@demo.com` / `admin123`
14. Show the live heatmap with zone densities
15. Show KPI cards: active attendees, avg response time, false alarm rate

### 4. Crowd Surge Demo (30s)
16. Run the simulator: `python simulator/simulator.py --auto`
17. Watch 300 attendees spawn on the heatmap
18. Trigger crowd surge at Main Stage → zone turns red
19. Show the crowd warning notification → "Notify staff" button
20. Show incident log + CSV export

---

## Roles & Access

| Role | URL | Login | Description |
|------|-----|-------|-------------|
| **Attendee** | `/e/{event_id}?zone=gate-1` | No login (QR scan) | Safety companion, SOS trigger |
| **Guard** | `/guard/login` | PIN: `1234` (Ravi), `2345` (Priya), `3456` (Amit), `4567` (Lakshmi), `5678` (Deepa) | Alert response, status updates |
| **Organizer** | `/org/login` | `organizer@demo.com` / `admin123` | Dashboard, heatmap, analytics |

---

## Seed Data

The demo seeds **Dexathon Fest 2026** with:

### Zones (6)

| Zone | Capacity | Type |
|------|----------|------|
| Main Stage | 500 | Stage |
| Food Court | 300 | Food |
| Workshop Hall | 200 | Workshop |
| Gate 1 | 150 | Entry |
| Parking | 100 | Parking |
| Restroom Block A | 80 | Restroom |

### Guards (5)

| Name | PIN | Zone Assignment |
|------|-----|----------------|
| Ravi Kumar | 1234 | Main Stage |
| Priya Sharma | 2345 | Food Court |
| Amit Singh | 3456 | Workshop Hall |
| Lakshmi Devi | 4567 | Gate 1 |
| Deepa Nair | 5678 | Roaming |

---

## Privacy & Compliance

SafeZone is designed with privacy as a core principle:

- **📍 Location shared ONLY during active alerts** — no ambient tracking
- **🗺️ Heatmap data is anonymous** — zone-level counts only, no individual tracking
- **🗑️ All data deleted after event** — configurable retention period
- **🇮🇳 DPDP Act 2023 compliant** — consent-first, minimal data collection
- **🔘 "Delete all event data" button** — one-click data purge for organizers
- **🔒 No third-party analytics** — no Google Analytics, no tracking pixels
- **📱 No app install** — no permissions to request (camera, contacts, etc.)

---

## Simulator

The simulator helps stress-test and demo the system with realistic crowd behavior.

### CLI Simulator

```bash
# Install dependencies
pip install -r simulator/requirements.txt

# Full auto demo — spawns 300 attendees, moves them, triggers surge + SOS
python simulator/simulator.py --auto

# Spawn attendees only
python simulator/simulator.py --spawn 500

# Trigger crowd surge in a specific zone
python simulator/simulator.py --surge "Main Stage"

# Fire a test SOS from a specific zone
python simulator/simulator.py --sos "Food Court"

# Interactive mode — manual control
python simulator/simulator.py
```

### Web Simulator

Open `simulator/web_simulator.html` in a browser (served via the frontend or directly). Provides a visual control panel with:

- 👥 Spawn/shuffle attendees
- 🌊 Trigger crowd surges with zone selector
- 🆘 Fire test SOS alerts
- 🎬 One-click auto-demo sequence
- 📋 Real-time activity log
- 📊 Live zone density bars

---

## Folder Structure

```
safezone/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, WebSocket setup
│   │   ├── config.py            # Environment & app settings
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models/              # ORM models
│   │   │   ├── event.py         # Event, Zone models
│   │   │   ├── attendee.py      # Attendee sessions
│   │   │   ├── guard.py         # Guard profiles & auth
│   │   │   └── alert.py         # SOS alerts & incidents
│   │   ├── routers/             # API route handlers
│   │   │   ├── events.py        # Event CRUD, zones, dashboard
│   │   │   ├── attendees.py     # Check-in, zone movement
│   │   │   ├── guards.py        # Guard auth, status
│   │   │   ├── alerts.py        # SOS creation, assignment, resolution
│   │   │   └── ws.py            # WebSocket connections
│   │   ├── services/            # Business logic
│   │   │   ├── alert_service.py # Alert routing, guard assignment
│   │   │   ├── crowd_service.py # Density calculation, warnings
│   │   │   └── export_service.py# CSV/report generation
│   │   └── utils/               # Helpers
│   │       ├── auth.py          # Token generation, PIN validation
│   │       └── geo.py           # Zone overlap & distance
│   ├── seeds/
│   │   └── seed_data.py         # Demo data seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # Route-level components
│   │   │   ├── AttendeeHome.jsx # Attendee safety companion
│   │   │   ├── GuardDashboard.jsx# Guard alert view
│   │   │   ├── OrgDashboard.jsx # Organizer heatmap + KPIs
│   │   │   └── Landing.jsx      # QR scan landing page
│   │   ├── components/          # Reusable UI
│   │   │   ├── SOSButton.jsx    # Long-press SOS trigger
│   │   │   ├── Heatmap.jsx      # Leaflet zone density map
│   │   │   ├── AlertCard.jsx    # Guard alert notification
│   │   │   └── ZoneBar.jsx      # Density progress bar
│   │   ├── stores/              # Zustand state
│   │   │   ├── attendeeStore.js # Attendee session state
│   │   │   ├── guardStore.js    # Guard auth & alerts
│   │   │   └── orgStore.js      # Organizer dashboard state
│   │   ├── api/                 # API client
│   │   │   └── client.js        # Axios/fetch wrapper
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useWebSocket.js  # WS connection manager
│   │   │   └── useSOS.js        # SOS trigger logic
│   │   └── utils/               # Frontend helpers
│   │       └── format.js        # Date, number formatting
│   └── package.json
├── simulator/
│   ├── simulator.py             # CLI crowd simulator
│   ├── web_simulator.html       # Browser-based simulator UI
│   └── requirements.txt         # Simulator Python deps
├── start.sh                     # One-command dev launcher
└── README.md                    # This file
```

---

## API Endpoints (Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List all events |
| `GET` | `/api/events/{id}/zones` | Get zones for an event |
| `GET` | `/api/events/{id}/dashboard` | Dashboard stats + densities |
| `POST` | `/api/events/{id}/checkin` | Attendee check-in (returns session token) |
| `POST` | `/api/attendees/{id}/zone` | Update attendee zone |
| `POST` | `/api/alerts` | Create SOS alert |
| `PUT` | `/api/alerts/{id}/status` | Update alert status |
| `POST` | `/api/guards/login` | Guard PIN auth |
| `POST` | `/api/org/login` | Organizer email/pass auth |
| `WS` | `/ws/guard/{guard_id}` | Guard real-time alerts |
| `WS` | `/ws/org/{event_id}` | Organizer live dashboard |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./safezone.db` | Database connection string |
| `SECRET_KEY` | `safezone-dev-key` | JWT/session secret |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |
| `CROWD_WARNING_THRESHOLD` | `0.85` | Zone density warning (85%) |
| `CROWD_CRITICAL_THRESHOLD` | `0.95` | Zone density critical (95%) |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

[MIT](LICENSE) — free for hackathons, events, and everything in between.

---

<p align="center">
  Built with ❤️ for safer events.<br>
  <strong>SafeZone</strong> — because everyone deserves to feel safe.
</p>
