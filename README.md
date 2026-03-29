# Supply Chain Attacks -- Cyber Session Materials

**Powered by CSEC CYBERSECURITY CLUB**
**Session Date:** Wednesday

## Web Application

A full MERN stack + FastAPI interactive presentation website with a cyber-themed UI.

### Quick Start

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
| `/theory` | 12-slide interactive presentation (arrow keys to navigate) |
| `/cases` | 5 real-world case studies with expandable timeline |
| `/labs` | Step-by-step walkthrough guides for TryHackMe + PortSwigger |
| `/demos` | Live demo runner (malicious postinstall, dependency confusion) |
| `/defense` | Defense cheat sheet with 6 categories + code examples |

## Workspace Structure

```
supplychain/
├── client/                            # React frontend (Vite)
│   └── src/
│       ├── components/                # Navbar, Footer, SlidePresenter, CodeBlock
│       └── pages/                     # Home, Theory, CaseStudies, Labs, Demos, Defense
├── server/                            # Express.js backend API
├── scripts-api/                       # FastAPI demo script runner
├── docs/                              # Markdown reference documents
│   ├── 01-theory-and-concepts.md
│   ├── 02-case-studies.md
│   ├── 03-lab-walkthrough-guide.md
│   └── 04-defense-cheatsheet.md
├── demos/                             # Practical demo files
│   ├── dependency-confusion/          # Full dependency confusion setup
│   └── malicious-postinstall/         # Postinstall hook demo
└── supply-chain-attack-simulator/     # 14-scenario attack simulator (cloned)
```

## Session Flow (90-120 min)

1. **Theory & Concepts** (30-40 min) -- `/theory` route, 12 interactive slides
2. **Case Studies** (15-20 min) -- `/cases` route, 5 expandable case studies
3. **Live Demos** (20-30 min) -- `/demos` route, run postinstall demo live
4. **Hands-On Labs** (30-40 min) -- `/labs` route, TryHackMe + PortSwigger
5. **Defense Wrap-Up** (10 min) -- `/defense` route, mitigation cheat sheet

## Lab Links

| Lab | URL | Cost |
|-----|-----|------|
| TryHackMe: Lottie | https://tryhackme.com/room/supplychainattacks | Free |
| PortSwigger: Cache Poisoning (Ambiguous) | https://portswigger.net/web-security/host-header/exploiting/lab-host-header-web-cache-poisoning-via-ambiguous-requests | Free |
| PortSwigger: Cache Poisoning (DOM) | https://portswigger.net/web-security/web-cache-poisoning/exploiting-design-flaws/lab-web-cache-poisoning-to-exploit-a-dom-vulnerability-via-a-cache-with-strict-cacheability-criteria | Free |
