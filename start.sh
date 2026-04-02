#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
#  CSEC Supply Chain Attack Session — Start All Services
# ──────────────────────────────────────────────────────────
#  Usage:  chmod +x start.sh && ./start.sh
#  Stop:   Press Ctrl+C (kills all background processes)
# ──────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Load nvm if available
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Colors
C='\033[36m' G='\033[32m' Y='\033[33m' R='\033[31m' D='\033[2m' B='\033[1m' X='\033[0m'

echo ""
echo -e "${C}${B}  ╔══════════════════════════════════════════════════╗${X}"
echo -e "${C}${B}  ║   CSEC Supply Chain Session — Starting...        ║${X}"
echo -e "${C}${B}  ╚══════════════════════════════════════════════════╝${X}"
echo ""

# Track PIDs for cleanup
PIDS=()
cleanup() {
  echo ""
  echo -e "${Y}  Shutting down all services...${X}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  echo -e "${G}  All services stopped.${X}"
  echo ""
}
trap cleanup EXIT INT TERM

# ── 1. Install dependencies if needed ─────────────────────
if [ ! -d "$ROOT/client/node_modules" ]; then
  echo -e "${Y}  Installing client dependencies...${X}"
  (cd "$ROOT/client" && npm install --legacy-peer-deps) || true
fi

if [ ! -d "$ROOT/server/node_modules" ]; then
  echo -e "${Y}  Installing server dependencies...${X}"
  (cd "$ROOT/server" && npm install) || true
fi

# ── 2. Start Express backend (port 5000) ──────────────────
echo -e "${G}  [1/3] Starting Express backend on port 5000...${X}"
(cd "$ROOT/server" && node server.js) &
PIDS+=($!)
sleep 1

# ── 3. Start FastAPI scripts-api (port 8000) ──────────────
echo -e "${G}  [2/3] Starting FastAPI scripts-api on port 8000...${X}"
(cd "$ROOT/scripts-api" && uvicorn main:app --port 8000) &
PIDS+=($!)
sleep 1

# ── 4. Start React frontend (port 3000) ───────────────────
echo -e "${G}  [3/3] Starting React frontend on port 3000...${X}"
(cd "$ROOT/client" && npx vite --port 3000) &
PIDS+=($!)
sleep 2

echo ""
echo -e "${C}${B}  ╔══════════════════════════════════════════════════╗${X}"
echo -e "${C}${B}  ║   All services running!                          ║${X}"
echo -e "${C}${B}  ╠══════════════════════════════════════════════════╣${X}"
echo -e "${G}${B}  ║   Frontend:    http://localhost:3000              ║${X}"
echo -e "${G}${B}  ║   Backend:     http://localhost:5000              ║${X}"
echo -e "${G}${B}  ║   Scripts API: http://localhost:8000              ║${X}"
echo -e "${C}${B}  ╠══════════════════════════════════════════════════╣${X}"
echo -e "${Y}${B}  ║   Press Ctrl+C to stop all services              ║${X}"
echo -e "${C}${B}  ╚══════════════════════════════════════════════════╝${X}"
echo ""

# Wait for all background processes
wait
