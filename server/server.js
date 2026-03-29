import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/+$/, ''))
  : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'csec-supplychain-server' });
});

app.get('/api/session', (_req, res) => {
  res.json({
    title: 'Supply Chain Attacks',
    club: 'CSEC Cybersecurity Club',
    parts: [
      { id: 'theory', name: 'Theory & Concepts', slides: 12 },
      { id: 'cases', name: 'Real-World Case Studies', count: 5 },
      { id: 'demos', name: 'Live Demos', count: 3 },
      { id: 'labs', name: 'Hands-On Labs', count: 3 },
      { id: 'defense', name: 'Defense & Mitigation', categories: 6 },
    ],
  });
});

app.get('/api/labs', (_req, res) => {
  res.json({
    labs: [
      {
        id: 'thm-lottie',
        name: 'TryHackMe: Supply Chain Attack - Lottie',
        url: 'https://tryhackme.com/room/supplychainattacks',
        difficulty: 'Easy',
        cost: 'Free',
      },
      {
        id: 'ps-cache-ambiguous',
        name: 'PortSwigger: Web Cache Poisoning via Ambiguous Requests',
        url: 'https://portswigger.net/web-security/host-header/exploiting/lab-host-header-web-cache-poisoning-via-ambiguous-requests',
        difficulty: 'Practitioner',
        cost: 'Free',
      },
      {
        id: 'ps-cache-dom',
        name: 'PortSwigger: Cache Poisoning to Exploit DOM Vulnerability',
        url: 'https://portswigger.net/web-security/web-cache-poisoning/exploiting-design-flaws/lab-web-cache-poisoning-to-exploit-a-dom-vulnerability-via-a-cache-with-strict-cacheability-criteria',
        difficulty: 'Expert',
        cost: 'Free',
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`[CSEC Server] Running on http://localhost:${PORT}`);
});
