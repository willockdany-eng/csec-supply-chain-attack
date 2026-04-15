# Demos -- Supply Chain Attack Scenarios

Three practical demonstrations covering the most common npm supply chain attack vectors.

## Overview

| Demo | Vector | Exfiltrates Data? | Requires Setup? |
|------|--------|-------------------|-----------------|
| [Malicious Postinstall](malicious-postinstall/) | Lifecycle hook abuse | No (local recon only) | No |
| [Dependency Confusion](dependency-confusion/) | Version resolution hijack | No (console output) | Yes (Verdaccio) |
| [Token Stealer](token-stealer/) | Full attack chain via npm | Yes (to deployed C2) | Yes (npm account) |

## 1. Malicious Postinstall

**Simplest demo.** Shows how `postinstall` hooks run arbitrary code during `npm install`.

```bash
cd malicious-postinstall
node malicious.js
```

Collects hostname, username, OS, sensitive file paths, and env vars -- all printed locally. No network calls. Good for explaining the core concept in under 2 minutes.

## 2. Dependency Confusion

Shows how a higher-versioned public package can hijack a private package name.

```bash
# Requires Verdaccio (local npm registry)
npm install -g verdaccio && verdaccio &
```

See [dependency-confusion/README.md](dependency-confusion/README.md) for the full setup.

## 3. Token Stealer (Main Demo)

The flagship demo. Replicates the March 2026 axios supply chain attack:

- Publish a benign-looking package to **real npm**
- Hidden dependency runs an **obfuscated postinstall** dropper
- Exfiltrates `.env` secrets, SSH keys, AWS credentials to a **live C2 dashboard**
- Dropper **erases itself** after execution

**C2 Dashboard:** [csec-supply-chain-attack.vercel.app](https://csec-supply-chain-attack.vercel.app/)

```bash
cd token-stealer/npm-publish
./publish.sh https://csec-supply-chain-attack.vercel.app
```

See [token-stealer/npm-publish/SESSION-GUIDE.md](token-stealer/npm-publish/SESSION-GUIDE.md) for the full 5-act presentation script.

## Session Recommendations

- **For time-constrained sessions:** Run Malicious Postinstall (2 min) + Token Stealer reveal on C2 dashboard (5 min)
- **For technical audiences:** Full Token Stealer demo with forensics + deobfuscation (15--20 min)
- **For workshops:** Add Dependency Confusion as a hands-on exercise (10 min)
