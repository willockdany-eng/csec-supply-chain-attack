# Malicious Postinstall Hook Demo

This demonstrates how npm lifecycle hooks (`postinstall`) can execute arbitrary code
on a developer's machine the moment they run `npm install`.

## What This Demonstrates

When you install an npm package, lifecycle scripts like `preinstall`, `install`, and
`postinstall` run **automatically** with the permissions of the current user. This is
exactly how attackers in supply chain attacks execute malicious code.

## How to Run

```bash
# Run the malicious.js directly to see what it collects
node malicious.js

# Or install the package to see automatic execution
cd /tmp && mkdir test-victim && cd test-victim
npm init -y
npm install /path/to/this/malicious-postinstall/
# The postinstall hook fires automatically!
```

## What the Script Collects (Simulation)

- System info (hostname, username, OS, architecture)
- Checks for sensitive files (~/.ssh/id_rsa, ~/.aws/credentials, etc.)
- Network interfaces and IP addresses
- Environment variables matching sensitive patterns (TOKEN, SECRET, KEY, etc.)

**No data is exfiltrated.** This is purely a local demonstration.

## Defense

```bash
# Install packages without running lifecycle scripts
npm install --ignore-scripts

# Or configure npm globally
npm config set ignore-scripts true

# Then manually run scripts for trusted packages
npm rebuild
```
