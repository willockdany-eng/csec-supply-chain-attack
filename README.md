# Supply Chain Attacks -- CSEC Cybersecurity Club

Interactive session materials for teaching software supply chain attacks: theory, real-world case studies, live demos, hands-on labs, and defense strategies.

## Live Links

| Service | URL |
|---------|-----|
| Presentation App | [Deployed on Vercel](https://csec-supplychain.vercel.app) (or run locally) |
| C2 Dashboard | [csec-supply-chain-attack.vercel.app](https://csec-supply-chain-attack.vercel.app/) |

## Quick Start (Local Dev)

```bash
# Terminal 1: React frontend (port 3000)
cd client && npm install && npm run dev

# Terminal 2: FastAPI script runner (port 8000) -- optional, for live demo execution
cd scripts-api && pip install -r requirements.txt && uvicorn main:app --port 8000
```

Open **http://localhost:3000** in your browser.

## Workspace Structure

```
supplychain/
├── client/                        # React presentation app (Vite)
│   └── src/
│       ├── components/            # Navbar, Footer, SlidePresenter, CodeBlock
│       └── pages/                 # Home, Theory, CaseStudies, Labs, Demos, LiveDemo, Defense
├── scripts-api/                   # FastAPI backend -- runs demo scripts on demand
├── docs/                          # Markdown reference documents
│   ├── 01-theory-and-concepts.md
│   ├── 02-case-studies.md
│   ├── 03-lab-walkthrough-guide.md
│   └── 04-defense-cheatsheet.md
└── demos/                         # Practical attack demos
    ├── dependency-confusion/      # Version resolution attack with local registry
    ├── malicious-postinstall/     # Postinstall lifecycle hook demo
    └── token-stealer/             # Full attack chain: C2 + npm publish + obfuscation
        ├── c2-server/             # Deployed C2 with Neon PostgreSQL
        ├── malicious-package/     # Educational payload (readable)
        └── npm-publish/           # Real npm publish workflow + deobfuscation exercise
```

## Session Flow (90--120 min)

| Block | Time | Route |
|-------|------|-------|
| Intro + ethics | 5--8 min | `/` |
| Theory | 28--35 min | `/theory` (13 slides, arrow keys) |
| Case studies | 12--18 min | `/cases` |
| Live demos | 22--30 min | `/demos` + [demos/](demos/) |
| npm token-stealer (optional) | 5--10 min | `/live-demo` + [SESSION-GUIDE](demos/token-stealer/npm-publish/SESSION-GUIDE.md) |
| Labs | 10--15 min or homework | `/labs` |
| Defense | 8--12 min | `/defense` |

## Pages

| Route | Content |
|-------|---------|
| `/` | CSEC branded landing page with session overview |
| `/theory` | 13-slide interactive presentation (arrow keys to navigate) |
| `/cases` | 6 real-world case studies with expandable details |
| `/labs` | Step-by-step walkthrough guides for TryHackMe + PortSwigger |
| `/demos` | Live demos (postinstall, dependency confusion, token stealer, axios hijack) |
| `/live-demo` | Facilitator checklist for the npm token-stealer demo |
| `/defense` | Defense cheat sheet with 9 categories + code examples |

## Lab Links

| Lab | URL | Cost |
|-----|-----|------|
| TryHackMe: Lottie | https://tryhackme.com/room/supplychainattacks | Free |
| PortSwigger: Cache Poisoning (Ambiguous) | https://portswigger.net/web-security/host-header/exploiting/lab-host-header-web-cache-poisoning-via-ambiguous-requests | Free |
| PortSwigger: Cache Poisoning (DOM) | https://portswigger.net/web-security/web-cache-poisoning/exploiting-design-flaws/lab-web-cache-poisoning-to-exploit-a-dom-vulnerability-via-a-cache-with-strict-cacheability-criteria | Free |

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Client (React) | Vercel | [`client/vercel.json`](client/vercel.json) |
| Client (alt) | GitHub Pages | [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) |
| Scripts API | Render | [`render.yaml`](render.yaml) |
| C2 Server | Vercel | [`demos/token-stealer/c2-server/`](demos/token-stealer/c2-server/) |
| C2 Database | Neon PostgreSQL | Connection via `DATABASE_URL` env var |
