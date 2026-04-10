const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('');
console.log('════════════════════════════════════════════════════════════════');
console.log('  AXIOS npm HIJACK — DROPPER SIMULATION (March 31, 2026)');
console.log('════════════════════════════════════════════════════════════════');
console.log('');
console.log('  This simulates what plain-crypto-js@4.2.1 did when its');
console.log('  postinstall hook ran during "npm install axios@1.14.1".');
console.log('');
console.log('  [SAFE] No network activity. No files written outside this demo.');
console.log('');

console.log('  ── Phase 1: Deobfuscation ──────────────────────────────────');
console.log('');
console.log('  Real dropper used two layers of obfuscation:');
console.log('  Layer 1: Reversed Base64 with padding char substitution');
console.log('  Layer 2: XOR cipher (key: "OrDeR_7077", constant: 333)');
console.log('');

const xorKey = 'OrDeR_7077';
const xorConst = 333;
const sample = 'fetch_platform_payload';
const encrypted = [];
for (let i = 0; i < sample.length; i++) {
  encrypted.push(sample.charCodeAt(i) ^ xorKey.charCodeAt(i % xorKey.length) ^ (xorConst & 0xFF));
}
const encoded = Buffer.from(encrypted).toString('base64').split('').reverse().join('');
console.log('  Sample plaintext:  "' + sample + '"');
console.log('  After XOR + rB64: "' + encoded + '"');

const decoded = Buffer.from(encoded.split('').reverse().join(''), 'base64');
let decrypted = '';
for (let i = 0; i < decoded.length; i++) {
  decrypted += String.fromCharCode(decoded[i] ^ xorKey.charCodeAt(i % xorKey.length) ^ (xorConst & 0xFF));
}
console.log('  Decrypted back:   "' + decrypted + '"');
console.log('');

console.log('  ── Phase 2: Platform Detection ─────────────────────────────');
console.log('');
const platform = os.platform();
const arch = os.arch();
console.log('  os.platform() = ' + platform);
console.log('  os.arch()     = ' + arch);
console.log('');

if (platform === 'darwin') {
  console.log('  [DETECTED] macOS — real attack would:');
  console.log('    1. AppleScript download binary to /Library/Caches/com.apple.act.mond');
  console.log('    2. Binary spoofs Apple daemon naming convention');
  console.log('    3. Generate 16-char victim ID');
  console.log('    4. Fingerprint: hostname, username, macOS version, CPU arch, processes');
  console.log('    5. Beacon to C2 every 60s (fake IE8/WinXP User-Agent)');
  console.log('    6. Accept commands: peinject, runscript, rundir, kill');
} else if (platform === 'win32') {
  console.log('  [DETECTED] Windows — real attack would:');
  console.log('    1. VBScript copy PowerShell to %PROGRAMDATA%\\wt.exe');
  console.log('    2. Masquerade as Windows Terminal');
  console.log('    3. Launch hidden PowerShell RAT with exec policy bypass');
} else {
  console.log('  [DETECTED] Linux — real attack would:');
  console.log('    1. Download Python RAT to /tmp/ld.py');
  console.log('    2. Launch via nohup python3 (orphaned background process)');
  console.log('    3. Detach from spawning terminal session');
}
console.log('');

console.log('  ── Phase 3: System Reconnaissance (what RAT collects) ──────');
console.log('');
console.log('  Hostname:     ' + os.hostname());
console.log('  Username:     ' + os.userInfo().username);
console.log('  Platform:     ' + platform + ' ' + os.release() + ' (' + arch + ')');
console.log('  Home:         ' + os.homedir());
console.log('  CPUs:         ' + os.cpus().length + 'x ' + (os.cpus()[0]?.model || 'unknown'));
console.log('  Memory:       ' + Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB total');
console.log('  Node:         ' + process.version);
console.log('');

const nets = os.networkInterfaces();
let netCount = 0;
for (const [name, addrs] of Object.entries(nets)) {
  for (const addr of addrs) {
    if (addr.family === 'IPv4' && !addr.internal) {
      console.log('  Network:      ' + name + ' → ' + addr.address + ' (MAC: ' + addr.mac + ')');
      netCount++;
    }
  }
}
if (!netCount) console.log('  Network:      no external IPv4 interfaces');
console.log('');

console.log('  ── Phase 4: Anti-Forensics (simulated) ─────────────────────');
console.log('');
console.log('  Real dropper would now:');
console.log('    1. fs.unlinkSync("setup.js")           — delete the dropper');
console.log('    2. fs.unlinkSync("package.json")       — delete postinstall trigger');
console.log('    3. fs.renameSync("package.md", "package.json") — replace with clean copy');
console.log('');
console.log('  After self-deletion, node_modules/plain-crypto-js/ looks clean.');
console.log('  No setup.js. No postinstall in package.json. No forensic evidence.');
console.log('');

console.log('  ── Phase 5: C2 Beacon (simulated) ──────────────────────────');
console.log('');
console.log('  Real RAT beacons to sfrclak[.]com:8000 every 60 seconds.');
console.log('  User-Agent: "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1)"');
console.log('  Payload: JSON with victim ID, system fingerprint, running processes');
console.log('');
console.log('  [SAFE] This simulation made ZERO network connections.');
console.log('');

console.log('════════════════════════════════════════════════════════════════');
console.log('  KEY LESSONS');
console.log('════════════════════════════════════════════════════════════════');
console.log('');
console.log('  1. Lockfiles save you — "npm ci" would have prevented pulling 1.14.1');
console.log('  2. --ignore-scripts blocks postinstall hooks entirely');
console.log('  3. No source code was changed — only package.json dependencies');
console.log('  4. The dropper erased itself — forensics found nothing suspicious');
console.log('  5. Nation-state actors (DPRK) are actively targeting npm maintainers');
console.log('  6. 100M weekly downloads × 3 hours = massive blast radius');
console.log('');
console.log('  References:');
console.log('  - https://github.com/axios/axios/issues/10636');
console.log('  - https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/');
console.log('');
console.log('════════════════════════════════════════════════════════════════');
