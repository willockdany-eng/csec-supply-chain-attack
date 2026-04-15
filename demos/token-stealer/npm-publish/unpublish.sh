#!/usr/bin/env bash
set -e

R='\033[31m' G='\033[32m' Y='\033[33m' C='\033[36m' B='\033[1m' D='\033[2m' X='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FORM_DIR="$SCRIPT_DIR/csec-form-helpers"
CRYPTO_DIR="$SCRIPT_DIR/csec-crypto-utils"

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

unpublish_one() {
  local pkg="$1"
  echo -e "  ${Y}[*]${X} Unpublishing ${pkg}..."
  set +e
  npm unpublish "$pkg" --force 2>&1
  ec=$?
  set -e
  if [ "$ec" -eq 0 ]; then
    echo -e "  ${G}[✓]${X} Removed ${pkg}"
  else
    echo -e "  ${D}  (failed or already removed — check npmjs.com)${X}"
  fi
  echo ""
}

if [ "$#" -gt 0 ]; then
  echo -e "  ${D}Using package names from arguments (e.g. legacy @scope/...).${X}"
  echo ""
  for pkg in "$@"; do
    unpublish_one "$pkg"
  done
else
  FORM_PKG=$(node -e "console.log(require('$FORM_DIR/package.json').name)")
  CRYPTO_PKG=$(node -e "console.log(require('$CRYPTO_DIR/package.json').name)")
  unpublish_one "$FORM_PKG"
  unpublish_one "$CRYPTO_PKG"
fi

echo -e "${G}${B}  [✓] Done. Verify on npmjs.com if needed.${X}"
echo ""
