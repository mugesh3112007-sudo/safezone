#!/bin/bash
# SafeZone — Start all services
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║        🛡️  SafeZone v1.0              ║"
echo "  ║  Free for attendees. Paid for by the  ║"
echo "  ║     events they protect.              ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Done.${NC}"
    exit 0
}
trap cleanup INT TERM

# Backend
echo -e "${CYAN}[1/3] Setting up backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo -e "  Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
echo -e "  Installing dependencies..."
pip install fastapi uvicorn sqlalchemy python-multipart qrcode websockets aiofiles pydantic -q

echo -e "  Seeding database..."
python -m seeds.seed_data 2>/dev/null || true

echo -e "${GREEN}  Starting backend on :8000${NC}"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "  Waiting for backend..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8000/api/events > /dev/null 2>&1; then
        echo -e "${GREEN}  Backend ready!${NC}"
        break
    fi
    sleep 1
done

# Frontend
echo -e "\n${CYAN}[2/3] Setting up frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "  Installing npm packages..."
    npm install
fi

echo -e "${GREEN}  Starting frontend on :5173${NC}"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

# Print URLs
sleep 3
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  SafeZone is running!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Frontend:${NC}   http://localhost:5173"
echo -e "  ${CYAN}Backend:${NC}    http://localhost:8000"
echo -e "  ${CYAN}API Docs:${NC}   http://localhost:8000/docs"
echo ""
echo -e "  ${YELLOW}Demo URLs:${NC}"
echo -e "  Attendee:   http://localhost:5173/demo"
echo -e "  Guard:      http://localhost:5173/guard/login"
echo -e "  Organizer:  http://localhost:5173/org/dashboard"
echo -e "  Simulator:  Open simulator/web_simulator.html in a browser"
echo ""
echo -e "  ${YELLOW}Simulator CLI:${NC}"
echo -e "  python3 simulator/simulator.py --auto"
echo ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop all services"
echo ""

wait
