import { FiPackage, FiGitBranch, FiGlobe, FiKey, FiSearch, FiAlertTriangle, FiShield, FiMonitor, FiClipboard } from 'react-icons/fi';
import CodeBlock from '../components/CodeBlock';

const categories = [
  {
    icon: <FiPackage />,
    color: 'cyan',
    title: 'Dependency Management',
    desc: 'Lock down how packages are resolved, installed, and updated.',
    items: [
      'Pin exact versions in package.json (no ^, ~, or *)',
      'Always commit lockfiles (package-lock.json, yarn.lock)',
      'Use scoped packages (@org/name) to prevent confusion',
      'Configure .npmrc to route scopes to private registry',
      'Use npm install --ignore-scripts for untrusted packages',
      'Reserve internal package names on public registries',
    ],
    code: `// .npmrc — force scoped packages from private registry
@mycompany:registry=https://npm.mycompany.com/
registry=https://registry.npmjs.org/

// package.json — exact versions only
{
  "dependencies": {
    "@mycompany/utils": "1.2.3",
    "lodash": "4.17.21"
  }
}`,
    codeLang: 'ini',
  },
  {
    icon: <FiGitBranch />,
    color: 'green',
    title: 'CI/CD Pipeline Security',
    desc: 'Harden build pipelines against action compromise and secret theft.',
    items: [
      'Pin GitHub Actions to commit SHAs, not tags',
      'Use least-privilege permissions for GITHUB_TOKEN',
      'Minimize secrets exposed to each job',
      'Separate test and deploy jobs (different secret scopes)',
      'Allowlist approved actions at org level',
      'Use OpenSSF Scorecard to evaluate action security',
    ],
    code: `# GOOD — SHA is immutable
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

# Restrict token permissions
permissions:
  contents: read
  packages: write

# Separate secrets per job
jobs:
  test:
    steps:
      - run: npm test  # No secrets needed!
  deploy:
    needs: test
    steps:
      - run: npm publish
        env:
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`,
    codeLang: 'yaml',
  },
  {
    icon: <FiGlobe />,
    color: 'purple',
    title: 'Frontend / CDN Security',
    desc: 'Prevent tampered scripts from loading in the browser.',
    items: [
      'Use Subresource Integrity (SRI) hashes on all CDN scripts',
      'Pin CDN script versions (never use @latest)',
      'Implement Content Security Policy (CSP)',
      'Self-host critical JavaScript when possible',
    ],
    code: `<!-- SRI hash prevents tampered scripts from loading -->
<script
  src="https://cdn.example.com/lib@2.1.0/lib.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6..."
  crossorigin="anonymous">
</script>

<!-- CSP restricts script sources -->
Content-Security-Policy:
  script-src 'self' https://cdn.trusted.com;
  connect-src 'self' https://api.myapp.com;`,
    codeLang: 'html',
  },
  {
    icon: <FiKey />,
    color: 'amber',
    title: 'Code Signing & Verification',
    desc: 'Verify the authenticity and integrity of software artifacts.',
    items: [
      'Use Sigstore / cosign for container image signing',
      'Enable npm provenance for published packages',
      'Implement SLSA framework for build provenance',
      'Verify checksums before executing downloaded scripts',
      'Enable MFA on all package registry accounts',
    ],
    code: `# Sign a container image with cosign
cosign sign --key cosign.key ghcr.io/org/image:v1.0.0

# Verify a container image
cosign verify --key cosign.pub ghcr.io/org/image:v1.0.0

# Publish npm package with provenance
npm publish --provenance

# Verify package signatures
npm audit signatures`,
    codeLang: 'bash',
  },
  {
    icon: <FiSearch />,
    color: 'blue',
    title: 'Monitoring & Detection',
    desc: 'Detect supply chain compromises through visibility and scanning.',
    items: [
      'Run npm audit / pip audit regularly',
      'Generate SBOMs (Software Bill of Materials)',
      'Use Socket.dev for behavioral analysis',
      'Monitor for unexpected network connections during builds',
      'Alert on lockfile changes without package.json changes',
      'Audit dependency update PRs before merging',
    ],
    code: `# Generate SBOM
syft dir:. -o spdx-json > sbom.json

# Scan SBOM for vulnerabilities
grype sbom:sbom.json

# Audit packages
npm audit
pip audit

# Snyk scanning
snyk test && snyk monitor`,
    codeLang: 'bash',
  },
  {
    icon: <FiShield />,
    color: 'cyan',
    title: 'Zero Trust Architecture',
    desc: 'Verify every user and device continuously -- never trust, always verify.',
    items: [
      'Authenticate and authorize every access request continuously',
      'Enforce least-privilege access for employees, contractors, vendors',
      'Microsegment networks to limit lateral movement after breach',
      'Monitor all user/device behavior for anomalies in real-time',
      'Assume breach -- design systems so one compromise cannot cascade',
      'Use identity-aware proxies instead of VPN-based perimeter trust',
    ],
    code: `# Zero Trust principles applied to supply chain:
# 1. Don't trust a package just because it's on npm
# 2. Don't trust a GH Action just because it's popular
# 3. Don't trust a CDN script without SRI verification
# 4. Don't trust CI/CD secrets to third-party actions
# 5. Verify checksums, signatures, provenance ALWAYS

# Example: require hash verification for pip
pip install --require-hashes -r requirements.txt

# Example: verify npm package provenance
npm audit signatures`,
    codeLang: 'bash',
  },
  {
    icon: <FiMonitor />,
    color: 'purple',
    title: 'Browser Isolation & Sandboxing',
    desc: 'Isolate untrusted code execution to prevent client-side supply chain attacks.',
    items: [
      'Use Remote Browser Isolation (RBI) for high-risk browsing',
      'Sandbox third-party scripts so they cannot access sensitive DOM',
      'Implement CSP to block inline scripts and unauthorized sources',
      'Use SRI hashes on every CDN-loaded script tag',
      'Load third-party tools server-side instead of client-side when possible',
      'Deploy Web Application Firewalls (WAF) to detect Magecart injections',
    ],
    code: `<!-- Content Security Policy — restrict what can execute -->
<meta http-equiv="Content-Security-Policy"
  content="
    script-src 'self' https://cdn.trusted.com;
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://api.myapp.com;
    frame-src 'none';
    object-src 'none';
  ">

<!-- SRI — verify CDN script integrity -->
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"></script>`,
    codeLang: 'html',
  },
  {
    icon: <FiClipboard />,
    color: 'green',
    title: 'Third-Party Risk Assessment',
    desc: 'Evaluate vendor and dependency security before integrating.',
    items: [
      'Test third-party software in sandbox before production deployment',
      'Require vendors to adhere to security policies and audits',
      'Evaluate package health: maintainer count, age, download trends',
      'Detect Shadow IT -- unapproved tools employees use without IT review',
      'Use CASB (Cloud Access Security Broker) for SaaS visibility',
      'Run OpenSSF Scorecard on every open-source dependency',
    ],
    code: `# OpenSSF Scorecard — evaluate dependency security
# Checks: code review, branch protection, CI tests,
#          dependency pinning, SAST, fuzzing, etc.
scorecard --repo=github.com/org/project

# Socket.dev — behavioral analysis of npm packages
# Detects: install scripts, network calls, filesystem
# access, obfuscated code, typosquats
npx socket optimize

# Check npm package health before installing
npm info <package-name>
# Look for: last publish date, maintainer count,
#           weekly downloads, known vulnerabilities`,
    codeLang: 'bash',
  },
  {
    icon: <FiAlertTriangle />,
    color: 'red',
    title: 'Incident Response',
    desc: 'What to do when you discover a supply chain compromise.',
    items: [
      'Identify and pin/rollback to a known-good version',
      'Rotate ALL accessible credentials immediately',
      'Check CI/CD logs for unauthorized access',
      'Audit all systems where the package was installed',
      'Check for persistence (backdoors, new accounts)',
      'Document, report malicious package to registry',
    ],
    code: `# Immediate response checklist
1. Identify compromised package & version
2. Rollback: npm install known-good-pkg@safe-version
3. Rotate credentials:
   - API keys and tokens
   - Cloud credentials (AWS, GCP, Azure)
   - SSH keys
   - npm/PyPI tokens
   - Database passwords
4. Review CI/CD logs for exfiltration
5. Scan for persistence mechanisms
6. Report to npm: npm unpublish malicious-pkg`,
    codeLang: 'bash',
  },
];

export default function Defense() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-tag">Part 5</div>
        <h1>Defense & Mitigation</h1>
        <p>Comprehensive cheat sheet of defensive measures organized by category. Practical commands and configurations you can implement today.</p>
      </div>

      <div className="defense-grid">
        {categories.map((cat, i) => (
          <div className="defense-card" key={i}>
            <div className={`defense-card-icon card-icon ${cat.color}`}>{cat.icon}</div>
            <h3>{cat.title}</h3>
            <p>{cat.desc}</p>
            <ul className="defense-items">
              {cat.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
            <CodeBlock language={cat.codeLang} code={cat.code} />
          </div>
        ))}
      </div>
    </div>
  );
}
