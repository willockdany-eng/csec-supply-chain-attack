# Token Stealer — Supply Chain Attack Demo

## The Concept

A developer has a project with secrets stored in a `.env` file — GitHub tokens, AWS keys, database URLs. Normal practice. They search for a form validation library, find **"csec-form-helpers"** on npm, and install it.

**The victim sees absolutely nothing suspicious.** Normal npm output. Zero warnings. The package works exactly as documented.

What actually happened: the package has a `postinstall` hook that runs silently during `npm install`. In under a second, it:

1. **Crawls the project directory tree** looking for `.env`, `.env.local`, `.env.production` files
2. **Parses every key=value pair** from those files
3. Harvests system info (hostname, username, OS, IP addresses, MAC)
4. Scans for other sensitive files (`~/.ssh/id_rsa`, `~/.aws/credentials`, `~/.npmrc`)
5. Sends **EVERYTHING** to the attacker's C2 server — silently, with zero output

The developer runs their app. Everything works. They have **no idea** their `.env` was just exfiltrated.

### Canonical paths (facilitators)

Use **one** path per session; switching mid-demo wastes time.

| Scenario | Path | Notes |
|----------|------|--------|
| **Audience / projector (recommended)** | [visual-demo/](visual-demo/) | Two browser tabs; no second machine. |
| **Two terminals, same machine** | [victim-app/](victim-app/) + [c2-server/](c2-server/) | Matches most README steps below. |
| **Two machines, local registry** | [live-session/](live-session/) | See [live-session/SESSION-GUIDE.md](live-session/SESSION-GUIDE.md). |

Do not maintain a separate scratch project at the repo root; use the folders above only.

---

## Demo Options

### Option 1: Visual Demo (Recommended for Sessions)

Best for presenting to an audience — two browser tabs side by side.

```bash
cd demos/token-stealer/visual-demo
node server.js
```

Open **two browser tabs side by side**:
- **Victim tab** → `http://localhost:3001` (looks like a developer's terminal)
- **Attacker tab** → `http://localhost:3001/attacker` (C2 dashboard)

On the victim tab, click the 3 buttons in order:
1. **"cat .env"** → shows the project's `.env` file with real-looking secrets
2. **"npm install"** → installs the package (normal output, nothing suspicious)
3. **"node app.js"** → runs the app (works perfectly)

Switch to the attacker tab — every secret from the `.env` file is there, plus system info, network interfaces, and sensitive file paths.

---

### Option 2: Terminal Demo (Two Terminals)

More realistic for technical audiences.

**Terminal 1 — Start the Attacker's C2 Server:**

```bash
cd demos/token-stealer/c2-server
node server.js
# Dashboard at http://localhost:4444
```

**Terminal 2 — Be the Victim:**

```bash
cd demos/token-stealer/victim-app

# Look at our .env — normal project secrets
cat .env

# Install the package (this triggers the attack)
C2_HOST=127.0.0.1 C2_PORT=4444 npm install

# Use the package — everything works
node app.js
```

**Notice:** the victim terminal shows standard npm output. Nothing else. No errors. No warnings.

Now look at Terminal 1 / the C2 dashboard — every single token from the `.env` file is displayed, along with hostname, IP, MAC address, and sensitive file paths.

---

## The .env File

Located at `victim-app/.env`:

```
GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890
NPM_TOKEN=npm_aB9xKzLmN8pQrStUvWx7654321fedcba
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
JWT_SECRET=super_secret_jwt_key_2026
DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp
STRIPE_SECRET_KEY=sk_live_51N3xAmPl3K3y0000000000
API_KEY=ak_prod_9f8e7d6c5b4a3210
```

These are demo tokens. In a real attack, these would be the developer's actual production secrets.

---

## Files

| File | Role |
|------|------|
| `victim-app/.env` | Developer's project secrets (what gets stolen) |
| `malicious-package/package.json` | Normal-looking package with `postinstall` hook |
| `malicious-package/index.js` | Legitimate form validation code (the cover) |
| `malicious-package/postinstall.js` | **THE PAYLOAD** — parses .env files, steals everything silently |
| `c2-server/server.js` | Attacker's C2 listener + web dashboard (port 4444) |
| `visual-demo/server.js` | Side-by-side visual demo for presentations (port 3001) |
| `victim-app/app.js` | Normal app using the package (works perfectly) |

## Key Takeaway

> The `postinstall` hook runs with YOUR user privileges. It can read any file you can read — including `.env`. **Zero output. Zero indication. Your secrets are gone.**
>
> **Defense:** `npm install --ignore-scripts`, never store secrets in plain `.env` (use vaults), pin dependencies, audit with `npm audit` / Socket.dev.
