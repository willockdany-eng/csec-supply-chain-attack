const os = require('os');
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
console.log(`  Hostname:     ${os.hostname()}`);
console.log(`  Username:     ${os.userInfo().username}`);
console.log(`  UID/GID:      ${os.userInfo().uid}/${os.userInfo().gid}`);
console.log(`  Home:         ${os.homedir()}`);
console.log(`  OS:           ${os.platform()} ${os.release()} (${os.arch()})`);
console.log(`  CPUs:         ${os.cpus().length}x ${os.cpus()[0]?.model || 'unknown'}`);
console.log(`  Memory:       ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB total`);
console.log(`  CWD:          ${process.cwd()}`);
console.log(`  Node:         ${process.version}`);
console.log('');

console.log('  ---- File System Enumeration ----');
console.log('');
const homeDir = os.homedir();
const interestingPaths = [
    '.ssh/id_rsa',
    '.ssh/id_ed25519',
    '.aws/credentials',
    '.npmrc',
    '.env',
    '.git-credentials',
    '.docker/config.json',
    '.kube/config',
    '.gnupg',
    '.bash_history'
];

for (const relPath of interestingPaths) {
    const fullPath = path.join(homeDir, relPath);
    const exists = fs.existsSync(fullPath);
    const status = exists ? 'FOUND' : '  --  ';
    console.log(`  [${status}] ~/${relPath}`);
}

console.log('');
console.log('  ---- Network Information ----');
console.log('');
const interfaces = os.networkInterfaces();
for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
            console.log(`  Interface:    ${name} -> ${addr.address}`);
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
            console.log(`  [LEAK] ${key} = ${masked}`);
            foundCount++;
            break;
        }
    }
}
if (foundCount === 0) {
    console.log('  No sensitive-looking env vars found in this environment.');
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
console.log('============================================================');
console.log('');
