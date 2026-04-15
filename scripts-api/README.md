# Scripts API -- Demo Runner

FastAPI backend that executes demo scripts on demand from the presentation app's Demos page.

## Setup

```bash
pip install -r requirements.txt
uvicorn main:app --port 8000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/run/health` | Health check |
| POST | `/run/demo` | Run a demo script by name |

### POST /run/demo

```json
{ "demo": "postinstall" }
```

Available demos:

| Name | Script | What It Does |
|------|--------|--------------|
| `postinstall` | `demos/malicious-postinstall/malicious.js` | Simulates recon via postinstall hook (local only, no exfil) |
| `token-stealer` | `demos/token-stealer/malicious-package/postinstall.js` | Runs the token-stealer payload |

## Deployment

Deployed on Render via `render.yaml`. The entire repo is cloned, so `../demos/` scripts are accessible. Both demo scripts use only Node.js built-ins (no `node_modules` needed).

## CORS

Set `ALLOWED_ORIGINS` env var to a comma-separated list of allowed origins. Defaults to `http://localhost:3000`.
