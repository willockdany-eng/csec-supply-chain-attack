# Supply Chain Attack Defense & Mitigation Cheat Sheet

## Quick Reference Matrix

| Defense Measure | Protects Against | Effort | Impact |
|----------------|-----------------|--------|--------|
| Pin exact versions | Malicious updates, dependency confusion | Low | High |
| Use lockfiles | Version substitution | Low | High |
| Scoped packages | Dependency confusion | Low | Very High |
| npm audit / pip audit | Known vulnerabilities | Low | Medium |
| MFA on registries | Account takeover | Low | Very High |
| Pin Actions to SHAs | CI/CD compromise | Medium | Very High |
| SRI hashes | CDN tampering | Low | High |
| SBOM generation | Visibility / tracking | Medium | Medium |
| Code signing (Sigstore) | Tampering | Medium | High |
| Secret minimization in CI | CI/CD credential theft | Medium | High |
| --ignore-scripts | Malicious install hooks | Low | High |

---

## 1. Dependency Management

### Pin Exact Versions

Never use ranges. Pin to exact versions to prevent unexpected updates.

```json
// BAD -- allows any compatible version (attacker publishes higher)
{
  "dependencies": {
    "lodash": "^4.17.0",
    "express": "~4.18.0",
    "axios": "*"
  }
}

// GOOD -- exact versions only
{
  "dependencies": {
    "lodash": "4.17.21",
    "express": "4.18.2",
    "axios": "1.6.2"
  }
}
```

### Always Commit Lockfiles

Lockfiles record the exact resolved version of every dependency.

```bash
# npm
# Always commit package-lock.json
git add package-lock.json

# pip
pip freeze > requirements.txt
# Or use pip-tools
pip-compile requirements.in

# yarn
# Always commit yarn.lock

# pnpm
# Always commit pnpm-lock.yaml
```

### Use Scoped Packages

Scoped packages prevent dependency confusion because the scope is a reserved namespace.

```json
// VULNERABLE -- unscoped, anyone can publish this name publicly
{
  "dependencies": {
    "mycompany-utils": "1.0.0"
  }
}

// SAFE -- scoped to @mycompany, namespace is reserved
{
  "dependencies": {
    "@mycompany/utils": "1.0.0"
  }
}
```

### Configure Private Registry Properly

```ini
# .npmrc -- force specific packages to come from your private registry

# All @mycompany scoped packages from private registry
@mycompany:registry=https://npm.mycompany.com/

# Everything else from public npm
registry=https://registry.npmjs.org/
```

### Disable Install Scripts for Untrusted Packages

```bash
# One-time: install without running lifecycle scripts
npm install --ignore-scripts

# Global config: always ignore scripts
npm config set ignore-scripts true

# Then manually run scripts for trusted packages
npm rebuild <trusted-package>
```

---

## 2. CI/CD Pipeline Security

### Pin GitHub Actions to Commit SHAs

Tags can be moved to point to malicious code. Commit SHAs are immutable.

```yaml
# BAD -- tag v4 can be reassigned to a malicious commit
- uses: actions/checkout@v4
- uses: tj-actions/changed-files@v41

# GOOD -- SHA is immutable, can never be changed
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
- uses: tj-actions/changed-files@716b1e13042866565e00e85fd4ec490e186c4a2f # v41.0.1
```

### Minimize Secrets in CI/CD

```yaml
# BAD -- job has access to all secrets
jobs:
  build:
    steps:
      - uses: actions/checkout@SHA
      - run: npm test
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

# GOOD -- separate jobs with minimal secrets
jobs:
  test:
    steps:
      - uses: actions/checkout@SHA
      - run: npm test
      # No secrets needed for testing!

  deploy:
    needs: test
    steps:
      - uses: actions/checkout@SHA
      - run: npm publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          # Only the secrets actually needed
```

### Use GitHub Action Permissions

```yaml
# Restrict the GITHUB_TOKEN permissions
permissions:
  contents: read     # read-only access to repo
  packages: write    # only if publishing packages
  # Don't grant permissions you don't need

jobs:
  build:
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@SHA
```

### Allowlist Approved Actions

In GitHub repository or organization settings:
- Settings > Actions > General
- Select "Allow select actions and reusable workflows"
- Only allow actions from verified creators and specific repos

---

## 3. Frontend / CDN Security

### Subresource Integrity (SRI)

SRI hashes ensure that CDN-loaded scripts haven't been tampered with.

```html
<!-- BAD -- no integrity check, CDN compromise = game over -->
<script src="https://cdn.example.com/library.js"></script>

<!-- GOOD -- browser verifies hash before executing -->
<script
  src="https://cdn.example.com/library@2.1.0/library.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous">
</script>
```

Generate SRI hashes:

```bash
# Generate hash for a local file
openssl dgst -sha384 -binary library.min.js | openssl base64 -A

# Or use https://www.srihash.org/
```

### Pin CDN Versions

```html
<!-- BAD -- loads latest, auto-gets malicious updates -->
<script src="https://unpkg.com/library@latest/dist/lib.js"></script>
<script src="https://cdn.jsdelivr.net/npm/library/dist/lib.js"></script>

<!-- GOOD -- pinned to specific version -->
<script src="https://unpkg.com/library@2.1.0/dist/lib.js"></script>
<script src="https://cdn.jsdelivr.net/npm/library@2.1.0/dist/lib.js"></script>
```

### Content Security Policy (CSP)

```http
Content-Security-Policy:
  script-src 'self' https://cdn.trusted.com;
  connect-src 'self' https://api.myapp.com;
  default-src 'self';
```

This prevents:
- Inline script injection
- Loading scripts from unauthorized domains
- Data exfiltration to unknown endpoints

---

## 4. Code Signing & Verification

### Sigstore / Cosign

```bash
# Sign a container image
cosign sign --key cosign.key ghcr.io/myorg/myimage:v1.0.0

# Verify a container image
cosign verify --key cosign.pub ghcr.io/myorg/myimage:v1.0.0
```

### npm Provenance

```bash
# Publish with provenance (generates SLSA provenance attestation)
npm publish --provenance

# Verify provenance
npm audit signatures
```

### SLSA (Supply-chain Levels for Software Artifacts)

| Level | Requirements |
|-------|-------------|
| SLSA 1 | Build process is documented |
| SLSA 2 | Build service generates authenticated provenance |
| SLSA 3 | Build service is hardened, isolated, and auditable |
| SLSA 4 | All dependencies are recursively verified |

---

## 5. Monitoring & Detection

### Package Audit Tools

```bash
# npm -- check for known vulnerabilities
npm audit
npm audit fix

# pip -- check Python packages
pip audit

# Snyk -- comprehensive scanning
snyk test
snyk monitor

# Socket.dev -- behavioral analysis
# (Available as GitHub App and CLI)
```

### SBOM (Software Bill of Materials)

```bash
# Generate SBOM with Syft
syft dir:. -o spdx-json > sbom.spdx.json

# Generate SBOM with CycloneDX
cyclonedx-npm --output-file sbom.json

# Scan SBOM for vulnerabilities with Grype
grype sbom:sbom.spdx.json
```

### Monitor for Anomalies

Signs of a supply chain compromise:
- Unexpected network connections during `npm install` or build
- New/changed dependencies not in the PR
- Lockfile changes without corresponding package.json changes
- CI/CD taking significantly longer than usual
- Unexpected processes spawned during build
- New outbound DNS requests to unknown domains

### Git Hooks for Detection

```bash
#!/bin/bash
# .git/hooks/pre-commit -- detect suspicious lockfile changes

# Check if lockfile changed without package.json changing
if git diff --cached --name-only | grep -q "package-lock.json"; then
    if ! git diff --cached --name-only | grep -q "package.json"; then
        echo "WARNING: package-lock.json changed without package.json"
        echo "This could indicate a lockfile injection attack."
        echo "Review the changes carefully before committing."
        exit 1
    fi
fi
```

---

## 6. Organizational Practices

### For Package Maintainers

- Enable **MFA** on npm, PyPI, and all registry accounts
- Use **automation tokens** with limited scope instead of personal tokens
- Use npm's **granular access tokens** (read-only, publish-only, scoped)
- Enable **npm provenance** for all published packages
- Set up **2FA requirement** for publishing at the package level
- Regularly **rotate** access tokens
- **Audit** who has publish access to your packages

### For Package Consumers

- **Audit dependencies** before adding them (`npm info <package>`)
- Check package **download counts, age, maintainer count**
- Prefer packages with **active maintenance** and **multiple maintainers**
- Use **lockfiles** and commit them to version control
- Set up **automated vulnerability scanning** (Dependabot, Renovate + Snyk)
- **Review** dependency update PRs before merging
- Use **private registries** as proxies to cache and verify packages

### For Organizations

- Maintain an **approved package list** / allowlist
- Run an **internal package registry** (Verdaccio, Artifactory, Nexus)
- Implement **SBOM generation** in CI/CD
- Set up **alerts** for new dependencies or version changes
- Conduct **supply chain security training** for developers
- Establish an **incident response plan** for supply chain compromises
- Participate in **OpenSSF** and contribute to supply chain security standards

---

## 7. Quick Command Reference

```bash
# ---- Auditing ----
npm audit                              # Check for known vulnerabilities
npm audit signatures                   # Verify package provenance
pip audit                              # Python package audit
snyk test                              # Snyk vulnerability scan

# ---- Safe Installation ----
npm install --ignore-scripts           # Skip lifecycle scripts
npm ci                                 # Clean install from lockfile only
pip install --require-hashes           # Require hash verification

# ---- Generating SBOMs ----
syft dir:. -o spdx-json                # Generate SPDX SBOM
cyclonedx-npm --output-file sbom.json  # Generate CycloneDX SBOM

# ---- Signing & Verification ----
cosign sign --key k ghcr.io/org/img    # Sign container image
cosign verify --key k ghcr.io/org/img  # Verify container image
npm publish --provenance               # Publish with SLSA provenance

# ---- Scanning SBOMs ----
grype sbom:sbom.spdx.json              # Scan SBOM for vulnerabilities
trivy fs .                             # Trivy filesystem scan

# ---- Registry Configuration ----
npm config set registry URL            # Set default registry
npm config set @scope:registry URL     # Set scoped registry
npm config set ignore-scripts true     # Globally disable scripts
```

---

## 8. Incident Response -- "You've Been Supply-Chain-Attacked"

### Immediate Actions (First Hour)

1. **Identify** the compromised package/version
2. **Pin/rollback** to a known-good version immediately
3. **Rotate ALL credentials** that were accessible to the compromised component:
   - API keys, tokens, passwords
   - Cloud credentials (AWS, GCP, Azure)
   - SSH keys
   - Database credentials
   - npm/PyPI tokens
4. **Check CI/CD logs** for unauthorized access or data exfiltration
5. **Alert** your security team and affected stakeholders

### Investigation (First Day)

6. **Audit** all systems where the compromised package was installed
7. **Check** for persistence mechanisms (backdoors, new accounts, cron jobs)
8. **Review** network logs for suspicious outbound connections
9. **Analyze** the malicious package code to understand the payload
10. **Determine** the blast radius -- what data/systems were exposed?

### Recovery (First Week)

11. **Rebuild** affected systems from known-good sources
12. **Update** dependencies to patched versions
13. **Implement** additional controls (SRI, pinning, audit)
14. **Document** the incident and lessons learned
15. **Report** the malicious package to the registry (npm, PyPI)

---

## Resources

| Resource | URL |
|----------|-----|
| MITRE ATT&CK T1195 | https://attack.mitre.org/techniques/T1195/ |
| OpenSSF Scorecard | https://securityscorecards.dev/ |
| Socket.dev | https://socket.dev/ |
| Snyk | https://snyk.io/ |
| Sigstore | https://sigstore.dev/ |
| SLSA Framework | https://slsa.dev/ |
| npm Provenance | https://docs.npmjs.com/generating-provenance-statements |
| SRI Hash Generator | https://www.srihash.org/ |
| CISA Supply Chain Guide | https://www.cisa.gov/supply-chain |
