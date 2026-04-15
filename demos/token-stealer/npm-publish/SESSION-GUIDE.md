# npm Supply Chain Attack — Live Session Guide

## Overview

This demo replicates the **March 31, 2026 axios supply chain attack** on the real npm registry. Two packages are published under your npm scope:

| Package | Role | Real-World Mirror |
|---------|------|-------------------|
| `csec-form-validator` | Legitimate-looking form validation library | `axios` (the trusted package) |
| `csec-crypto-toolkit` | Hidden dependency with obfuscated postinstall dropper | `plain-crypto-js` (the malicious dep) |

The victim installs `csec-form-validator`, which silently pulls `csec-crypto-toolkit`. The obfuscated `postinstall` hook exfiltrates `.env` secrets to the C2 server, then **erases itself** leaving no trace.

**C2 Dashboard (deployed):** [https://csec-supply-chain-attack.vercel.app/](https://csec-supply-chain-attack.vercel.app/)

---

## Prerequisites

- **npm account** with publishing access (`npm login`)
- **Node.js** on the victim machine (or your own machine for solo demo)

---

## Before the Session

### Step 1 — Log in to npm

```bash
npm login
```

### Step 2 — Publish both packages

```bash
cd demos/token-stealer/npm-publish
./publish.sh https://csec-supply-chain-attack.vercel.app
```

This single command:
1. Builds the obfuscated dropper (`setup.js`) with the C2 URL baked in
2. Publishes `csec-crypto-toolkit` (the hidden dependency) to npm
3. Publishes `csec-form-validator` (the main package) to npm

### Step 3 — Verify

- Open [npmjs.com/package/csec-form-validator](https://www.npmjs.com/package/csec-form-validator) — looks like a normal form validation library
- Open the [C2 Dashboard](https://csec-supply-chain-attack.vercel.app/) — log in and confirm it's ready

> **Note:** If using scoped packages (`@yourname/csec-form-validator`), the publish script auto-patches `@yourname` to your npm username.

---

## Presentation Script

### Act 1: The "Innocent" Install

**On the victim machine (or have a participant do this).**

Narrate:

> "I'm a developer starting a new project. I need form validation."

```bash
mkdir my-project && cd my-project
npm init -y
```

> "My project has secrets in a .env file — API keys, database credentials. Standard stuff."

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
npm install csec-form-validator
```

**Pause.** Point out that npm output looks completely normal. No warnings. No errors.

> "Let's use it — works great!"

```bash
node -e "
const { validateEmail, validatePassword } = require('csec-form-validator');
console.log('Email valid:', validateEmail('user@corp.com'));
console.log('Password:', validatePassword('Test@1234'));
"
```

---

### Act 2: The Reveal

**Switch to the C2 dashboard:** [https://csec-supply-chain-attack.vercel.app/](https://csec-supply-chain-attack.vercel.app/)

All the victim's secrets are now displayed:
- Every key-value pair from `.env` (GitHub token, AWS keys, Stripe, database URL)
- Hostname, username, OS, IP addresses, MAC address
- Contents of sensitive files found (`~/.ssh/id_rsa`, `~/.aws/credentials`, `~/.npmrc`)
- Network interfaces

> "The postinstall hook ran silently during `npm install`. Your secrets were gone before you typed your first line of code."

---

### Act 3: The Forensic Investigation

> "Let's investigate. Where did the attack come from?"

**On the victim machine:**

```bash
# The package works fine — nothing suspicious
ls node_modules/csec-form-validator/
# index.js, package.json — clean

# Check the hidden dependency
ls node_modules/csec-crypto-toolkit/
# index.js, package.json — also looks clean!
# No setup.js. No postinstall in package.json.
# The dropper ERASED ITSELF after running.

# But the lockfile tells the truth
cat package-lock.json | grep -A 5 "csec-crypto-toolkit"
# Shows the dependency exists — pulled in automatically
```

> "The attacker's code deleted itself after execution. If you inspect node_modules after the fact, you see nothing suspicious. This is exactly what the real axios attack did."

---

### Act 4: Reverse Engineering the Obfuscation

> "Let's go back to the source and reverse-engineer the attack."

**On the attacker machine:**

```bash
cd demos/token-stealer/npm-publish

# Look at the raw dropper — a wall of obfuscated text
cat csec-crypto-utils/setup.js

# Deobfuscate it layer by layer
node deobfuscate.js
```

Walk through each layer the script reveals:
1. **Examine** — a huge encoded string, a key, a constant, a decoder function
2. **Reverse the string** — first layer undone
3. **Restore Base64 padding** — `!` back to `=`
4. **Base64 decode** — binary data revealed
5. **XOR decrypt** — with key `OrDeR_7077` and constant `333`
6. **The plaintext payload** — full .env scanner, system recon, C2 exfiltration, self-deletion

> "This is the exact same double-obfuscation technique the real axios attacker used. Reversed Base64 with padding substitution, XOR cipher. Two layers that defeat most static analysis tools."

---

### Act 5: Defense Discussion

> "How could this have been prevented?"

| Defense | What It Does |
|---------|--------------|
| `npm install --ignore-scripts` | Blocks postinstall hooks entirely |
| Lockfiles + `npm ci` | Prevents pulling unexpected versions |
| Socket.dev / Snyk | Flags suspicious postinstall behavior (Socket detected the real attack in 6 minutes) |
| `npm info <pkg>` before installing | Shows hidden dependencies |
| Secrets vaults (AWS Secrets Manager, HashiCorp Vault) | Never store raw secrets in `.env` |
| MFA on npm accounts | The real attack started with a hijacked maintainer account |
| Short-lived tokens / OIDC publishing | No long-lived npm access tokens to steal |

---

## After the Session

Remove both packages from npm **immediately**:

```bash
cd demos/token-stealer/npm-publish
./unpublish.sh
```

For scoped packages published under a different name:

```bash
./unpublish.sh @yourscope/csec-form-validator @yourscope/csec-crypto-toolkit
```

> npm has a **72-hour unpublish window** for packages with no dependents. After that, contact npm support.

---

## File Map

| File | Role |
|------|------|
| `csec-form-helpers/index.js` | Clean form validation code (the cover) |
| `csec-form-helpers/package.json` | Depends on `csec-crypto-toolkit` (the hidden chain) |
| `csec-crypto-utils/index.js` | Benign crypto helpers (another cover) |
| `csec-crypto-utils/package.json` | Has `postinstall: node setup.js` (the trigger) |
| `csec-crypto-utils/setup.js` | **THE OBFUSCATED DROPPER** (generated by build script) |
| `csec-crypto-utils/package.md` | Clean package.json copy (used in self-deletion swap) |
| `payload.js` | Plaintext payload source (not published) |
| `build-obfuscated.js` | Encodes payload with reversed Base64 + XOR |
| `deobfuscate.js` | Reverse engineering exercise — decodes setup.js layer by layer |
| `publish.sh` | One-command publish to real npm (pass C2 URL as argument) |
| `unpublish.sh` | One-command cleanup after session |

---

## How This Maps to the Real Axios Attack

| Axios Attack (March 31, 2026) | This Demo |
|-------------------------------|-----------|
| `axios@1.14.1` (trusted, 100M downloads) | `csec-form-validator` |
| `plain-crypto-js@4.2.1` (hidden dependency) | `csec-crypto-utils` |
| `setup.js` postinstall dropper | `setup.js` postinstall dropper |
| Reversed Base64 + XOR (key: `OrDeR_7077`, const: `333`) | Same obfuscation, same key, same constant |
| Self-deletion + package.json swap | Self-deletion + package.md swap |
| Cross-platform RAT (macOS/Win/Linux) | Recon + .env exfiltration (safe, no RAT) |
| C2 at `sfrclak[.]com:8000` | C2 at [csec-supply-chain-attack.vercel.app](https://csec-supply-chain-attack.vercel.app/) |
| Attributed to Sapphire Sleet (DPRK) | Educational demo |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm ERR! 402` on publish | Scoped packages need `--access public` (already handled by publish.sh) |
| `npm ERR! 403` — 2FA required | npm requires 2FA or a granular access token with publish permission. Go to [npmjs.com](https://www.npmjs.com) -> Access Tokens -> Generate New Token (Granular) -> enable Publish |
| `npm ERR! 403` (other) | Package name may be taken. Change the name in package.json files |
| Secrets don't appear on C2 | Verify the victim has a `.env` file. Check that the correct C2 URL was passed to `publish.sh` |
| Self-deletion didn't work | Check `node_modules/csec-crypto-utils/` — `__dirname` may differ in some npm versions |
| Unpublish fails | npm has a 72-hour unpublish window. After that, contact npm support |
| HTTPS errors in payload | Make sure you passed the full URL with `https://` to publish.sh |
