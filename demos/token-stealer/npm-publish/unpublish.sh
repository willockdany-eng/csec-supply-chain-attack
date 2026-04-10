#!/usr/bin/env bash
set -e

R='\033[31m' G='\033[32m' Y='\033[33m' C='\033[36m' B='\033[1m' D='\033[2m' X='\033[0m'

echo ""
echo -e "${Y}${B}  ╔═══════════════════════════════════════════════════════════╗${X}"
echo -e "${Y}${B}  ║     UNPUBLISH — Remove packages from npm                 ║${X}"
echo -e "${Y}${B}  ╚═══════════════════════════════════════════════════════════╝${X}"
echo ""

NPM_USER=$(npm whoami 2>/dev/null || echo "")
if [ -z "$NPM_USER" ]; then
  echo -e "${R}  [!] You are not logged into npm. Run: npm login${X}"
  exit 1
fi

SCOPE="@${NPM_USER}"
FORM_PKG="${SCOPE}/csec-form-helpers"
CRYPTO_PKG="${SCOPE}/csec-crypto-utils"

echo -e "  ${Y}[*]${X} Unpublishing ${FORM_PKG}..."
npm unpublish "$FORM_PKG" --force 2>&1 && \
  echo -e "  ${G}[✓]${X} Removed ${FORM_PKG}" || \
  echo -e "  ${D}  (may already be removed)${X}"
echo ""

echo -e "  ${Y}[*]${X} Unpublishing ${CRYPTO_PKG}..."
npm unpublish "$CRYPTO_PKG" --force 2>&1 && \
  echo -e "  ${G}[✓]${X} Removed ${CRYPTO_PKG}" || \
  echo -e "  ${D}  (may already be removed)${X}"
echo ""

echo -e "${G}${B}  [✓] Cleanup complete. Both packages removed from npm.${X}"
echo ""
