# Supply Chain Attacks -- Cyber Session Materials

**Powered by CSEC CYBERSECURITY CLUB**
**Session Date:** Wednesday

## Web Application

A full MERN stack + FastAPI interactive presentation website with a cyber-themed UI.

### Quick Start

```bash
# One command (backend + scripts API + frontend)
chmod +x start.sh && ./start.sh
```

Or three terminals:

```bash
# Terminal 1: React Frontend (port 3000)
cd client && npm run dev

# Terminal 2: Express Backend (port 5000)
cd server && npm run dev

# Terminal 3: FastAPI Script Runner (port 8000)
cd scripts-api && uvicorn main:app --port 8000
```

Open **http://localhost:3000** in your browser.

### Tech Stack

| Service | Tech | Port | Purpose |
|---------|------|------|---------|
| Frontend | React + Vite | 3000 | Interactive presentation UI |
| Backend | Express.js | 5000 | Session data API |
| Scripts | FastAPI | 8000 | Demo script execution |

### Pages

| Route | Content |
|-------|---------|
| `/` | Home -- CSEC branded landing page with session overview |
| `/theory` | 13-slide interactive presentation (arrow keys to navigate) |
| `/cases` | 6 real-world case studies with expandable timeline |
| `/labs` | Step-by-step walkthrough guides for TryHackMe + PortSwigger |
| `/demos` | 5 live demos (postinstall, dependency confusion, token stealer, axios hijack, typosquatting) |
| `/live-demo` | Facilitator checklist for npm-hosted token-stealer demo (if used) |
| `/defense` | Defense cheat sheet with 9 categories + code examples |

## Workspace Structure

```
supplychain/
├── client/                            # React frontend (Vite)
│   └── src/
│       ├── components/                # Navbar, Footer, SlidePresenter, CodeBlock
│       └── pages/                     # Home, Theory, CaseStudies, Labs, Demos, LiveDemo, Defense
├── server/                            # Express.js backend API
├── scripts-api/                       # FastAPI demo script runner
├── docs/                              # Markdown reference documents
│   ├── 01-theory-and-concepts.md
│   ├── 02-case-studies.md
│   ├── 03-lab-walkthrough-guide.md
│   └── 04-defense-cheatsheet.md
└── demos/                             # Practical demo files
    ├── dependency-confusion/          # Full dependency confusion setup
    ├── malicious-postinstall/         # Postinstall hook demo
    └── token-stealer/                 # C2, visual-demo, victim-app, live-session, npm-publish
```

**Optional (not in this repository):** `supply-chain-attack-simulator/` — a separate clone referenced in [docs/03-lab-walkthrough-guide.md](docs/03-lab-walkthrough-guide.md) Lab 5. It is gitignored until you add it locally.

Token stealer demos: canonical facilitator paths are documented in [demos/token-stealer/README.md](demos/token-stealer/README.md).

## Session Flow (90–120 min)

**Tight run (~95 min):** intro 5–8 min, theory 28–35 min, cases 12–18 min (2–3 cases, not all six), live demos 22–30 min, labs overview or homework 10–15 min, defense 8–12 min.

**90 minutes only:** shorten theory (~22 min, skip optional video slide), cases (~10 min, two cases), labs to “homework + 3 min overview”, demos 20–25 min.

**120 minutes:** add 10–15 min Q&A after theory, optional 5 min break, 15–20 min for TryHackMe start (AttackBox) or extended dependency-confusion walkthrough.

| Block | Time | Route / material |
|-------|------|------------------|
| Intro + ethics | 5–8 min | `/` |
| Theory | 28–35 min | `/theory` (13 slides) |
| Case studies | 12–18 min | `/cases` |
| Live demos | 22–30 min | `/demos` + [demos/](demos/) |
| Live npm demo (optional) | 5–10 min | `/live-demo` |
| Labs | 10–15 min or homework | `/labs`, [docs/03-lab-walkthrough-guide.md](docs/03-lab-walkthrough-guide.md) |
| Defense | 8–12 min | `/defense` |

Do not run the full TryHackMe Lottie room (~60 min) inside the session block; assign it or demo a short local lab instead.

## Lab Links

| Lab | URL | Cost |
|-----|-----|------|
| TryHackMe: Lottie | https://tryhackme.com/room/supplychainattacks | Free |
| PortSwigger: Cache Poisoning (Ambiguous) | https://portswigger.net/web-security/host-header/exploiting/lab-host-header-web-cache-poisoning-via-ambiguous-requests | Free |
| PortSwigger: Cache Poisoning (DOM) | https://portswigger.net/web-security/web-cache-poisoning/exploiting-design-flaws/lab-web-cache-poisoning-to-exploit-a-dom-vulnerability-via-a-cache-with-strict-cacheability-criteria | Free |
