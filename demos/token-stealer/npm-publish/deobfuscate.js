#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const R = '\x1b[31m', G = '\x1b[32m', Y = '\x1b[33m', C = '\x1b[36m', B = '\x1b[1m', D = '\x1b[2m', X = '\x1b[0m';

console.log('');
console.log(`${R}${B}  ╔═══════════════════════════════════════════════════════════╗${X}`);
console.log(`${R}${B}  ║   REVERSE ENGINEERING EXERCISE — Deobfuscating setup.js   ║${X}`);
console.log(`${R}${B}  ╚═══════════════════════════════════════════════════════════╝${X}`);
console.log('');

const setupPath = process.argv[2] || path.join(__dirname, 'csec-crypto-utils', 'setup.js');

if (!fs.existsSync(setupPath)) {
  console.log(`${R}  [!] File not found: ${setupPath}${X}`);
  console.log(`  ${D}Run build-obfuscated.js first, or provide the path to setup.js${X}`);
  console.log(`  ${D}Usage: node deobfuscate.js [path/to/setup.js]${X}`);
  console.log('');
  process.exit(1);
}

const raw = fs.readFileSync(setupPath, 'utf-8');

console.log(`${Y}${B}  ── Step 1: Examine the file ──${X}`);
console.log('');
console.log(`  ${D}File: ${setupPath}${X}`);
console.log(`  ${D}Size: ${raw.length} bytes${X}`);
console.log('');
console.log(`  ${C}What we see:${X}`);
console.log(`  A huge obfuscated string assigned to _0x, a key, a constant,`);
console.log(`  a decoder function _d(), and a try/catch that runs new Function(_d(_0x))`);
console.log('');

const blobMatch = raw.match(/var _0x = '([^']+)'/);
const keyMatch = raw.match(/var _k = '([^']+)'/);
const constMatch = raw.match(/_c = (\d+)/);
const padSubMatch = raw.match(/_p = '([^']+)'/);
const padOrigMatch = raw.match(/_o = '([^']+)'/);

if (!blobMatch || !keyMatch || !constMatch) {
  console.log(`${R}  [!] Could not extract obfuscated components from the file.${X}`);
  process.exit(1);
}

const blob = blobMatch[1];
const xorKey = keyMatch[1];
const xorConst = parseInt(constMatch[1]);
const padSub = padSubMatch ? padSubMatch[1] : '!';
const padOrig = padOrigMatch ? padOrigMatch[1] : '=';

console.log(`${Y}${B}  ── Step 2: Extract the components ──${X}`);
console.log('');
console.log(`  ${G}Obfuscated blob:${X} ${blob.substring(0, 60)}...`);
console.log(`  ${G}  (${blob.length} characters)${X}`);
console.log(`  ${G}XOR key:${X}         "${xorKey}"`);
console.log(`  ${G}XOR constant:${X}    ${xorConst}`);
console.log(`  ${G}Pad substitute:${X}  '${padSub}' -> '${padOrig}'`);
console.log('');

console.log(`${Y}${B}  ── Step 3: Layer 1 — Reverse the string ──${X}`);
console.log('');
const reversed = blob.split('').reverse().join('');
console.log(`  ${D}Before:${X} ${blob.substring(0, 50)}...`);
console.log(`  ${D}After:${X}  ${reversed.substring(0, 50)}...`);
console.log('');

console.log(`${Y}${B}  ── Step 4: Layer 2 — Restore Base64 padding ──${X}`);
console.log('');
const padRestored = reversed.replace(new RegExp('\\' + padSub, 'g'), padOrig);
console.log(`  ${D}Replaced '${padSub}' back to '${padOrig}'${X}`);
console.log(`  ${D}Result:${X} ${padRestored.substring(0, 50)}...`);
console.log('');

console.log(`${Y}${B}  ── Step 5: Layer 3 — Base64 decode ──${X}`);
console.log('');
const decoded = Buffer.from(padRestored, 'base64');
console.log(`  ${D}Decoded ${padRestored.length} chars -> ${decoded.length} bytes${X}`);
console.log('');

console.log(`${Y}${B}  ── Step 6: Layer 4 — XOR decrypt ──${X}`);
console.log('');
console.log(`  ${D}XOR each byte with key "${xorKey}" (cycling) XOR ${xorConst} & 0xFF${X}`);
const decrypted = Buffer.alloc(decoded.length);
for (let i = 0; i < decoded.length; i++) {
  decrypted[i] = decoded[i] ^ xorKey.charCodeAt(i % xorKey.length) ^ (xorConst & 0xFF);
}
const plaintext = decrypted.toString('utf-8');
console.log('');

console.log(`${R}${B}  ── Step 7: THE DEOBFUSCATED PAYLOAD ──${X}`);
console.log('');
console.log(`${R}${'─'.repeat(64)}${X}`);
plaintext.split('\n').forEach((line, i) => {
  console.log(`  ${D}${String(i + 1).padStart(3)}${X} ${line}`);
});
console.log(`${R}${'─'.repeat(64)}${X}`);
console.log('');

const c2Match = plaintext.match(/C2_HOST\s*=\s*'([^']+)'/);
const portMatch = plaintext.match(/C2_PORT\s*=\s*(\d+)/);
const hasEnvScan = plaintext.includes('.env');
const hasSelfDelete = plaintext.includes('unlinkSync');
const hasNetScan = plaintext.includes('networkInterfaces');

console.log(`${Y}${B}  ── Step 8: Analysis ──${X}`);
console.log('');
console.log(`  ${R}[C2 SERVER]${X}       ${c2Match ? c2Match[1] + ':' + (portMatch ? portMatch[1] : '?') : 'not found'}`);
console.log(`  ${R}[.ENV SCAN]${X}       ${hasEnvScan ? 'YES — crawls project tree for .env files' : 'no'}`);
console.log(`  ${R}[NETWORK RECON]${X}   ${hasNetScan ? 'YES — enumerates network interfaces' : 'no'}`);
console.log(`  ${R}[SELF-DELETION]${X}   ${hasSelfDelete ? 'YES — erases setup.js + swaps package.json' : 'no'}`);
console.log('');
console.log(`${G}${B}  ── Summary ──${X}`);
console.log('');
console.log(`  This postinstall hook uses double obfuscation (reversed Base64 + XOR)`);
console.log(`  to hide a payload that:`);
console.log(`    1. Crawls the project for .env files and parses all secrets`);
console.log(`    2. Scans process.env for known sensitive keys`);
console.log(`    3. Checks for SSH keys, AWS creds, npmrc, git-credentials`);
console.log(`    4. Enumerates network interfaces (IP + MAC)`);
console.log(`    5. Exfiltrates everything to ${c2Match ? c2Match[1] : 'C2 server'} via HTTP POST`);
console.log(`    6. Deletes itself and restores a clean package.json`);
console.log('');
console.log(`  ${Y}This is exactly how the axios@1.14.1 attack worked on March 31, 2026.${X}`);
console.log('');
