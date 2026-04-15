# Client -- Presentation App

React + Vite interactive presentation for the CSEC Supply Chain Attack session.

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

## Tech Stack

- **React 19** with react-router-dom v7
- **Vite 6** for dev server and builds
- **react-syntax-highlighter** (Prism) for code blocks
- **react-icons** (Feather) for iconography

## Pages

| Route | Component | Content |
|-------|-----------|---------|
| `/` | `Home.jsx` | Landing page with session overview cards |
| `/theory` | `Theory.jsx` | 13-slide deck (arrow keys / buttons to navigate) |
| `/cases` | `CaseStudies.jsx` | 6 real-world incidents with expandable details |
| `/labs` | `Labs.jsx` | TryHackMe + PortSwigger walkthroughs |
| `/demos` | `Demos.jsx` | Live demo explanations + script runner integration |
| `/live-demo` | `LiveDemo.jsx` | Facilitator checklist for the npm token-stealer |
| `/defense` | `Defense.jsx` | Defense strategies across 9 categories |

## Shared Components

- **`Navbar`** -- Top nav with route links, CSEC logo, light/dark theme toggle
- **`Footer`** -- CSEC branding and attribution
- **`SlidePresenter`** -- Keyboard-driven slide deck used by Theory page
- **`CodeBlock`** -- Syntax-highlighted code with copy button, theme-aware

## Deployment

- **Vercel** -- `vercel.json` rewrites all routes to `index.html` (SPA)
- **GitHub Pages** -- `.github/workflows/deploy.yml` builds and deploys `dist/`

## Environment Variables

See `.env.example`. Only `VITE_SCRIPTS_API_URL` is used (for the demo script runner).
