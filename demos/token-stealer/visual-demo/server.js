const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT) || 3001;

const envFilePath = path.join(__dirname, '..', 'victim-app', '.env');
let envVars = {};
try {
  const content = fs.readFileSync(envFilePath, 'utf-8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq === -1) return;
    envVars[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  });
} catch {
  envVars = {
    GITHUB_TOKEN: 'ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890',
    NPM_TOKEN: 'npm_aB9xKzLmN8pQrStUvWx7654321fedcba',
    AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
    AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    JWT_SECRET: 'super_secret_jwt_key_2026',
    DATABASE_URL: 'postgres://admin:s3cret@prod-db.internal:5432/myapp',
  };
}

let stolenData = null;

const nets = os.networkInterfaces();
const network = [];
Object.entries(nets).forEach(([n, a]) => a.forEach(x => {
  if (x.family === 'IPv4' && !x.internal) network.push({ iface: n, ip: x.address, mac: x.mac });
}));

const sensitiveFiles = ['.ssh/id_rsa', '.ssh/id_ed25519', '.aws/credentials', '.npmrc', '.env', '.git-credentials']
  .filter(f => { try { fs.statSync(path.join(os.homedir(), f)); return true; } catch { return false; } });

function victimPage() {
  const envJson = JSON.stringify(envVars);
  return `<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Developer Terminal — Victim View</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'JetBrains Mono','Fira Code','Courier New',monospace;background:#0c0c0c;color:#ccc;min-height:100vh;display:flex;flex-direction:column}
.top{background:#1a1a2e;padding:10px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #333}
.top .dots{display:flex;gap:6px}
.top .dot{width:12px;height:12px;border-radius:50%}
.top .r{background:#ff5f57}.top .y{background:#febc2e}.top .g{background:#28c840}
.top .title{color:#888;font-size:.78rem;flex:1;text-align:center}
.term{flex:1;padding:16px;overflow-y:auto;font-size:.85rem;line-height:1.6}
.line{white-space:pre-wrap;word-break:break-all}
.prompt{color:#3fb950}
.cmd{color:#eee}
.info{color:#58a6ff}
.warn{color:#d29922}
.ok{color:#3fb950}
.dim{color:#555}
.bar{background:#111;border-top:1px solid #333;padding:10px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.bar .hint{color:#555;font-size:.72rem;flex:1;min-width:200px}
.btn{background:#238636;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-family:inherit;font-size:.82rem;cursor:pointer;font-weight:600}
.btn:hover{background:#2ea043}
.btn:disabled{background:#333;color:#666;cursor:not-allowed}
.env-file{background:#111;border:1px solid #222;border-radius:6px;margin:8px 0;padding:12px;font-size:.78rem}
.env-comment{color:#6a737d}
.env-key{color:#d29922}
.env-val{color:#3fb950}
</style></head><body>
<div class="top">
<div class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
<div class="title">Terminal — developer@workstation:~/my-project</div>
</div>
<div class="term" id="t">
<div class="line"><span class="prompt">dev@workstation:~/my-project$</span> <span class="dim">▌</span></div>
</div>
<div class="bar">
<div class="hint">Step 1: Show .env file &rarr; Step 2: Install the package &rarr; Step 3: Use it</div>
<button class="btn" id="b1" onclick="showEnv()">1. cat .env</button>
<button class="btn" id="b2" onclick="doInstall()" disabled>2. npm install</button>
<button class="btn" id="b3" onclick="usePackage()" disabled>3. node app.js</button>
</div>

<script>
const t=document.getElementById('t');
function add(html,cls){const d=document.createElement('div');d.className='line '+(cls||'');d.innerHTML=html;t.appendChild(d);t.scrollTop=t.scrollHeight;}
function prompt(cmd){add('<span class="prompt">dev@workstation:~/my-project$</span> <span class="cmd">'+cmd+'</span>');}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}

async function showEnv(){
  document.getElementById('b1').disabled=true;
  prompt('cat .env');
  await wait(300);
  const env=${envJson};
  let h='<div class="env-file">';
  h+='<div class="env-comment">## My Project Secrets — DO NOT COMMIT ##</div><br>';
  Object.entries(env).forEach(([k,v])=>{
    h+='<div><span class="env-key">'+k+'</span>=<span class="env-val">'+v+'</span></div>';
  });
  h+='</div>';
  add(h);
  await wait(200);
  prompt('');
  document.getElementById('b2').disabled=false;
}

async function doInstall(){
  document.getElementById('b2').disabled=true;
  prompt('npm install csec-form-helpers');
  await wait(600);
  add('');
  const lines=[
    {t:'<span class="dim">npm warn deprecated inflight@1.0.6: This module is not supported</span>',d:300},
    {t:'',d:150},
    {t:'<span class="info">added 1 package, and audited 2 packages in 3s</span>',d:900},
    {t:'',d:150},
    {t:'<span class="ok">found 0 vulnerabilities</span>',d:300},
  ];
  for(const l of lines){await wait(l.d);add(l.t);}
  await wait(400);
  prompt('');
  add('<span class="dim"># Package installed. Everything looks completely normal.</span>');
  document.getElementById('b3').disabled=false;

  // Trigger the silent exfiltration
  fetch('/api/simulate-attack',{method:'POST'});
}

async function usePackage(){
  document.getElementById('b3').disabled=true;
  prompt('node app.js');
  await wait(400);
  add('');
  const output=[
    {t:'  ── My Web App: Form Validation Demo ──',d:100},
    {t:'',d:80},
    {t:'  Email "user@example.com" → <span class="ok">✓ valid</span>',d:120},
    {t:'  Email "bad-email" → <span style="color:#f85149">✗ invalid</span>',d:120},
    {t:'  Email "admin@corp.io" → <span class="ok">✓ valid</span>',d:120},
    {t:'',d:80},
    {t:'  Password "MyP@ss123":',d:100},
    {t:'    Length ≥ 8:    <span class="ok">✓</span>',d:60},
    {t:'    Uppercase:     <span class="ok">✓</span>',d:60},
    {t:'    Number:        <span class="ok">✓</span>',d:60},
    {t:'    Special char:  <span class="ok">✓</span>',d:60},
    {t:'    Overall:       <span class="ok">✓ STRONG</span>',d:80},
    {t:'',d:80},
    {t:'  ── Everything works perfectly! ──',d:200},
  ];
  for(const l of output){await wait(l.d);add(l.t);}
  await wait(500);
  prompt('');
  add('<span class="dim"># ✅ App works. Developer is happy. No idea their .env was stolen.</span>');
  add('<span class="warn"># ↑ Switch to the ATTACKER tab to see what actually happened.</span>');
}
</script></body></html>`;
}

function attackerPage() {
  return `<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>C2 Dashboard — Attacker View</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'JetBrains Mono','Fira Code',monospace;background:#080808;color:#ccc;min-height:100vh}
.bar{background:linear-gradient(90deg,#1a0000,#080808);border-bottom:2px solid #f8514933;padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
.bar h1{color:#f85149;font-size:1rem;display:flex;align-items:center;gap:8px}
.bar .live{display:flex;align-items:center;gap:6px;font-size:.75rem;color:#8b949e}
.bar .dot{width:8px;height:8px;border-radius:50%;background:#3fb950;animation:p 1.5s infinite}
@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
.wrap{max-width:960px;margin:0 auto;padding:1.5rem}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:1.5rem}
.st{background:#111;border:1px solid #222;border-radius:8px;padding:16px;text-align:center}
.st .v{font-size:1.8rem;font-weight:700;color:#f85149}
.st .l{font-size:.68rem;color:#666;text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
.empty{text-align:center;padding:5rem 2rem;color:#444}
.empty .icon{font-size:3rem;margin-bottom:1rem}
.card{background:#0d0d0d;border:1px solid #f8514933;border-radius:10px;margin-bottom:1rem;overflow:hidden;animation:si .4s}
@keyframes si{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.ch{background:#111;padding:12px 18px;border-bottom:1px solid #f8514922;display:flex;justify-content:space-between;align-items:center}
.ch h2{color:#f85149;font-size:.88rem}.ch .tm{color:#555;font-size:.72rem}
.sec{padding:12px 18px;border-bottom:1px solid #151515}
.sec h3{color:#f85149;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.src{font-size:.65rem;color:#555;margin-bottom:6px;font-style:italic}
.row{display:flex;justify-content:space-between;padding:3px 0;font-size:.8rem}
.row .k{color:#666}.row .vl{color:#aaa}
.tk{display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:#0a0a0a;border-radius:5px;margin-bottom:5px;border-left:3px solid #f85149;animation:ti .3s}
@keyframes ti{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
.tk .tn{color:#f85149;font-size:.78rem;font-weight:700}
.tk .tv{color:#3fb950;font-size:.75rem;word-break:break-all;max-width:58%;text-align:right}
.ft{display:inline-block;background:#f8514918;color:#f85149;padding:2px 8px;border-radius:3px;font-size:.72rem;margin:2px}
.nt{font-size:.78rem;color:#666;padding:2px 0}
</style></head><body>
<div class="bar">
<h1>&#x1f480; C2 Command &amp; Control</h1>
<div class="live"><span class="dot"></span>LISTENING :${PORT}</div>
</div>
<div class="wrap">
<div class="stats">
<div class="st"><div class="v" id="nV">0</div><div class="l">Victims</div></div>
<div class="st"><div class="v" id="nT">0</div><div class="l">Secrets Stolen</div></div>
<div class="st"><div class="v" id="nE">0</div><div class="l">.env Files</div></div>
<div class="st"><div class="v" id="nF">0</div><div class="l">Sensitive Files</div></div>
</div>
<div id="feed"><div class="empty"><div class="icon">&#x1f4e1;</div>Waiting for victims...<br><small style="color:#333">Victim just needs to run: npm install csec-form-helpers</small></div></div>
</div>
<script>
let shown=false;
setInterval(async()=>{
  const r=await fetch('/api/stolen');
  const d=await r.json();
  if(!d||shown)return;
  shown=true;
  document.querySelector('.empty')?.remove();
  document.getElementById('nV').textContent='1';

  const tks=d.tokens||{};
  document.getElementById('nT').textContent=Object.keys(tks).length;
  document.getElementById('nE').textContent='1';
  document.getElementById('nF').textContent=(d.files||[]).length;

  let envH='<div class="src">Source: ~/my-project/.env</div>';
  Object.entries(tks).forEach(([k,v])=>{envH+='<div class="tk"><span class="tn">'+k+'</span><span class="tv">'+v+'</span></div>';});

  let fh='';(d.files||[]).forEach(f=>{fh+='<span class="ft">~/'+f+'</span>';});
  let nh='';(d.network||[]).forEach(n=>{nh+='<div class="nt">'+n.iface+': '+n.ip+' ('+n.mac+')</div>';});

  const c=document.createElement('div');c.className='card';
  c.innerHTML='<div class="ch"><h2>&#x1f6a8; Victim #1 &mdash; '+d.system.hostname+'</h2><span class="tm">'+d.time+'</span></div>'+
  '<div class="sec"><h3>System</h3>'+
  '<div class="row"><span class="k">Hostname</span><span class="vl">'+d.system.hostname+'</span></div>'+
  '<div class="row"><span class="k">Username</span><span class="vl">'+d.system.username+'</span></div>'+
  '<div class="row"><span class="k">Platform</span><span class="vl">'+d.system.platform+'</span></div>'+
  '<div class="row"><span class="k">Home</span><span class="vl">'+d.system.home+'</span></div>'+
  '<div class="row"><span class="k">Node</span><span class="vl">'+d.system.node+'</span></div></div>'+
  '<div class="sec"><h3>&#x1f4c1; Stolen from .env File</h3>'+envH+'</div>'+
  (fh?'<div class="sec"><h3>Sensitive Files Found</h3>'+fh+'</div>':'')+
  (nh?'<div class="sec"><h3>Network</h3>'+nh+'</div>':'');
  document.getElementById('feed').prepend(c);
},800);
</script></body></html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(victimPage());
    return;
  }

  if (url.pathname === '/attacker' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(attackerPage());
    return;
  }

  if (url.pathname === '/api/simulate-attack' && req.method === 'POST') {
    stolenData = {
      time: new Date().toISOString(),
      system: {
        hostname: os.hostname(),
        username: os.userInfo().username,
        platform: os.platform() + ' ' + os.arch(),
        home: os.homedir(),
        node: process.version,
      },
      tokens: { ...envVars },
      files: sensitiveFiles,
      network: network,
    };
    console.log(`\n\x1b[31m\x1b[1m  [!] VICTIM COMPROMISED\x1b[0m — ${stolenData.system.hostname}@${stolenData.system.username}`);
    console.log(`  \x1b[33m[.ENV]\x1b[0m Stole ${Object.keys(envVars).length} secrets from .env file`);
    Object.entries(envVars).forEach(([k, v]) =>
      console.log(`    \x1b[31m${k}\x1b[0m = \x1b[32m${v.substring(0, 25)}${v.length > 25 ? '...' : ''}\x1b[0m`)
    );
    console.log('');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url.pathname === '/api/stolen' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stolenData));
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => {
  console.log(`\n\x1b[32m\x1b[1m  ╔══════════════════════════════════════════════════════╗`);
  console.log(`  ║        VISUAL SUPPLY CHAIN ATTACK DEMO               ║`);
  console.log(`  ╚══════════════════════════════════════════════════════╝\x1b[0m\n`);
  console.log(`  \x1b[36mVictim (Developer) :\x1b[0m  http://localhost:${PORT}`);
  console.log(`  \x1b[31mAttacker (C2)      :\x1b[0m  http://localhost:${PORT}/attacker\n`);
  console.log(`  \x1b[2mOpen BOTH tabs side by side for your audience.\x1b[0m`);
  console.log(`  \x1b[2mClick buttons on Victim tab — watch Attacker tab light up.\x1b[0m\n`);
  console.log(`  \x1b[33m.env loaded:\x1b[0m ${Object.keys(envVars).length} secrets from ${envFilePath}\n`);
});
