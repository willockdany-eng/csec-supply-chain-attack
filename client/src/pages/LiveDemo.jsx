import { useState } from 'react';
import { FiChevronDown, FiTerminal, FiGlobe, FiEye, FiSearch, FiCode, FiShield, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import CodeBlock from '../components/CodeBlock';

const phases = [
  {
    id: 'publish',
    num: '00',
    title: 'Publish the Packages',
    subtitle: 'Attacker Machine',
    icon: <FiTerminal />,
    color: 'red',
    narrator: 'Before the session begins, the attacker publishes two packages to the real npm registry.',
    steps: [
      {
        label: 'Run the publish script with the C2 server URL',
        code: `cd ~/Desktop/supplychain/demos/token-stealer/npm-publish
./publish.sh https://csec-c2-server.onrender.com`,
        lang: 'bash',
        note: 'This builds the obfuscated dropper, publishes csec-crypto-toolkit@4.2.1 (hidden dependency), then publishes csec-form-validator@1.0.0 (the "innocent" package).',
      },
      {
        label: 'Verify on npmjs.com',
        code: `# Open in browser:
https://www.npmjs.com/package/csec-form-validator
https://www.npmjs.com/package/csec-crypto-toolkit`,
        lang: 'bash',
        note: 'Both packages look completely legitimate — clean descriptions, keywords, MIT license.',
      },
      {
        label: '(Optional) Secure the C2 with a token and clear spam',
        code: `# Set C2_SECRET env var on Render (Settings > Environment)
# Then rebuild. Only your payload will be accepted.
# To clear old spam data before the demo:
curl -X POST https://csec-c2-server.onrender.com/reset`,
        lang: 'bash',
        note: 'The C2 is public — security scanners will find it. Set C2_SECRET on both Render and in your shell before running publish.sh to lock it down. POST /reset clears all stored victims.',
      },
    ],
  },
  {
    id: 'registry',
    num: '01',
    title: 'Show the Registry',
    subtitle: 'Attacker Perspective',
    icon: <FiGlobe />,
    color: 'cyan',
    narrator: '"Let me show you what a normal npm package looks like."',
    steps: [
      {
        label: 'Open csec-form-validator on npm',
        code: `https://www.npmjs.com/package/csec-form-validator`,
        lang: 'text',
        note: '"Description looks normal. Keywords: form, validation, sanitize. Looks legit."',
      },
      {
        label: 'Point out the hidden dependency',
        code: null,
        note: '"Scroll to Dependencies — it depends on csec-crypto-toolkit. Sounds harmless, right? Crypto helpers."',
      },
      {
        label: 'Open csec-crypto-toolkit on npm',
        code: `https://www.npmjs.com/package/csec-crypto-toolkit`,
        lang: 'text',
        note: '"Also looks clean. But notice: postinstall: node setup.js in package.json. That runs automatically on npm install."',
      },
      {
        label: 'Open the C2 dashboard',
        code: `https://csec-c2-server.onrender.com`,
        lang: 'text',
        note: '"This is the attacker\'s C2 dashboard. Zero victims. Waiting..."',
      },
    ],
  },
  {
    id: 'victim',
    num: '02',
    title: 'Be the Victim',
    subtitle: 'Second Machine or Terminal',
    icon: <FiTerminal />,
    color: 'amber',
    narrator: '"Now I\'m a developer starting a new project."',
    steps: [
      {
        label: 'Create a new project',
        code: `mkdir my-project && cd my-project
npm init -y`,
        lang: 'bash',
        note: '"I\'m a developer starting a new project."',
      },
      {
        label: 'Add secrets (like any real project has)',
        code: `cat > .env << 'EOF'
GITHUB_TOKEN=ghp_R3aLt0k3nF0rD3m0Purp0s3s1234567890
NPM_TOKEN=npm_aB9xKzLmN8pQrStUvWx7654321fedcba
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DATABASE_URL=postgres://admin:s3cret@prod-db.internal:5432/myapp
STRIPE_SECRET_KEY=sk_live_51N3xAmPl3K3y0000000000
EOF`,
        lang: 'bash',
        note: '"My project has secrets — API keys, database credentials, payment keys."',
      },
      {
        label: 'Install the "form validation library"',
        code: `npm install csec-form-validator`,
        lang: 'bash',
        note: '"I found a form validation library on npm. Looks good."',
      },
      {
        label: 'Observe the output',
        code: `added 2 packages, 0 vulnerabilities`,
        lang: 'text',
        note: '"Completely normal. No warnings. No errors. But notice — 2 packages installed. The developer asked for 1. That second one is the hidden dependency."',
      },
      {
        label: 'Use the package — it works perfectly',
        code: `node -e "
const { validateEmail, validatePassword } = require('csec-form-validator');
console.log('Email valid:', validateEmail('user@corp.com'));
console.log('Password:', validatePassword('Test@1234'));
"`,
        lang: 'bash',
        note: null,
      },
      {
        label: 'Expected output',
        code: `Email valid: true
Password: {
  length: true,
  uppercase: true,
  lowercase: true,
  number: true,
  special: false,
  valid: true
}`,
        lang: 'text',
        note: '"Works perfectly. The developer suspects nothing."',
      },
    ],
  },
  {
    id: 'reveal',
    num: '03',
    title: 'The Reveal',
    subtitle: 'Switch to C2 Dashboard',
    icon: <FiEye />,
    color: 'red',
    narrator: '"Now let\'s switch to the attacker\'s screen."',
    steps: [
      {
        label: 'Refresh the C2 dashboard',
        code: `https://csec-c2-server.onrender.com`,
        lang: 'text',
        note: null,
      },
      {
        label: 'What the dashboard now shows',
        code: null,
        note: null,
        dashboard: true,
      },
    ],
    keyTalkingPoint: 'The postinstall hook ran during npm install. In under a second it crawled the project for .env files, scanned for SSH keys and cloud credentials, and sent everything to our server. The developer saw: "added 2 packages, 0 vulnerabilities". That was it.',
  },
  {
    id: 'forensics',
    num: '04',
    title: 'Forensic Investigation',
    subtitle: 'Back on Victim Machine',
    icon: <FiSearch />,
    color: 'purple',
    narrator: '"Let\'s investigate. Where is the malicious code?"',
    steps: [
      {
        label: 'Check the main package',
        code: `ls node_modules/csec-form-validator/`,
        lang: 'bash',
        note: '"index.js, package.json — nothing suspicious."',
      },
      {
        label: 'Check the hidden dependency',
        code: `ls node_modules/csec-crypto-toolkit/`,
        lang: 'bash',
        note: '"index.js, package.json — also clean! No setup.js. No postinstall in package.json."',
      },
      {
        label: 'Prove the self-deletion',
        code: `cat node_modules/csec-crypto-toolkit/package.json`,
        lang: 'bash',
        note: '"No scripts section at all. The dropper erased itself and swapped package.json with a clean copy."',
      },
      {
        label: 'The lockfile remembers',
        code: `cat package-lock.json | grep -A 5 "csec-crypto-toolkit"`,
        lang: 'bash',
        note: '"The only forensic trace. package-lock.json shows the transitive dependency was pulled in."',
      },
    ],
    keyTalkingPoint: 'The real axios attack did this exact thing. After execution, setup.js deleted itself and swapped package.json with a clean copy. Forensic inspection of node_modules shows absolutely nothing. The only clue is in package-lock.json.',
  },
  {
    id: 'reverse',
    num: '05',
    title: 'Reverse Engineering',
    subtitle: 'Attacker Machine',
    icon: <FiCode />,
    color: 'cyan',
    narrator: '"Let\'s go back to the source and reverse-engineer the obfuscation."',
    steps: [
      {
        label: 'Look at the raw dropper',
        code: `cd ~/Desktop/supplychain/demos/token-stealer/npm-publish
cat csec-crypto-utils/setup.js`,
        lang: 'bash',
        note: '"A wall of obfuscated gibberish. Let\'s decode it layer by layer."',
      },
      {
        label: 'Run the deobfuscator',
        code: `node deobfuscate.js`,
        lang: 'bash',
        note: null,
      },
      {
        label: 'What the deobfuscator reveals (8 steps)',
        code: null,
        note: null,
        deobSteps: true,
      },
    ],
  },
  {
    id: 'defense',
    num: '06',
    title: 'Defense Discussion',
    subtitle: 'Ask the Audience',
    icon: <FiShield />,
    color: 'green',
    narrator: '"How could this have been prevented?"',
    steps: [],
    defenses: [
      { cmd: 'npm install --ignore-scripts', desc: 'Blocks ALL postinstall hooks' },
      { cmd: 'Lockfiles + npm ci', desc: 'Committed lockfile prevents pulling unexpected versions' },
      { cmd: 'Socket.dev / Snyk', desc: 'Flagged the real attack within 6 minutes' },
      { cmd: 'npm info <pkg>', desc: 'Audit before installing — shows hidden dependencies' },
      { cmd: 'Secret vaults', desc: 'Never store raw secrets in .env — use AWS Secrets Manager, HashiCorp Vault' },
      { cmd: 'MFA on npm accounts', desc: 'The real attack started with a hijacked maintainer account' },
      { cmd: 'SRI hashes / pinned versions', desc: 'For CDN-loaded scripts and CI pipelines' },
    ],
  },
  {
    id: 'cleanup',
    num: '07',
    title: 'Cleanup',
    subtitle: 'After the Session',
    icon: <FiTrash2 />,
    color: 'amber',
    narrator: 'Remove the packages from npm immediately after the demo.',
    steps: [
      {
        label: 'Unpublish both packages',
        code: `cd ~/Desktop/supplychain/demos/token-stealer/npm-publish
./unpublish.sh`,
        lang: 'bash',
        note: 'Removes both csec-form-validator and csec-crypto-toolkit from the public registry.',
      },
      {
        label: 'Remove legacy scoped packages (if they exist)',
        code: `./unpublish.sh @dany47/csec-form-helpers @dany47/csec-crypto-utils`,
        lang: 'bash',
        note: null,
      },
      {
        label: 'Clean up the victim project',
        code: `rm -rf ~/my-project`,
        lang: 'bash',
        note: null,
      },
    ],
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="ld-copy-btn" onClick={handleCopy} title="Copy command">
      {copied ? <FiCheck /> : <FiCopy />}
    </button>
  );
}

function DashboardMock() {
  return (
    <div className="ld-dashboard-mock">
      <div className="ld-dash-header">
        <span className="ld-dash-skull">&#x1F480;</span>
        <span>C2 Command &amp; Control</span>
        <span className="ld-dash-status">LISTENING</span>
      </div>
      <div className="ld-dash-stats">
        <div className="ld-dash-stat"><span className="ld-dash-val red">1</span><span className="ld-dash-label">Victims</span></div>
        <div className="ld-dash-stat"><span className="ld-dash-val amber">6</span><span className="ld-dash-label">Secrets</span></div>
        <div className="ld-dash-stat"><span className="ld-dash-val cyan">1</span><span className="ld-dash-label">.env Files</span></div>
      </div>
      <div className="ld-dash-victim">
        <div className="ld-dash-victim-title">VICTIM #1</div>
        <div className="ld-dash-row"><span className="ld-dash-key">hostname</span><span className="ld-dash-value">victim-laptop</span></div>
        <div className="ld-dash-row"><span className="ld-dash-key">username</span><span className="ld-dash-value">developer</span></div>
        <div className="ld-dash-row"><span className="ld-dash-key">platform</span><span className="ld-dash-value">linux x64</span></div>
        <div className="ld-dash-divider">.env secrets</div>
        <div className="ld-dash-row"><span className="ld-dash-key">GITHUB_TOKEN</span><span className="ld-dash-value secret">ghp_R3aLt0k3n...</span></div>
        <div className="ld-dash-row"><span className="ld-dash-key">AWS_ACCESS_KEY_ID</span><span className="ld-dash-value secret">AKIAIOSFOD...</span></div>
        <div className="ld-dash-row"><span className="ld-dash-key">DATABASE_URL</span><span className="ld-dash-value secret">postgres://admin:s3cret...</span></div>
        <div className="ld-dash-row"><span className="ld-dash-key">STRIPE_SECRET_KEY</span><span className="ld-dash-value secret">sk_live_51N3x...</span></div>
        <div className="ld-dash-divider">sensitive files</div>
        <div className="ld-dash-row"><span className="ld-dash-key">found</span><span className="ld-dash-value">~/.ssh/id_rsa, ~/.npmrc, ~/.git-credentials</span></div>
      </div>
    </div>
  );
}

function DeobSteps() {
  const steps = [
    { n: 1, title: 'Examine', desc: 'Huge encoded string, a key, a constant, a decoder function' },
    { n: 2, title: 'Extract', desc: 'XOR key: OrDeR_7077, constant: 333, padding: ! \u2192 =' },
    { n: 3, title: 'Reverse', desc: 'First layer — reverse the string' },
    { n: 4, title: 'Restore padding', desc: 'Replace ! back to = for valid Base64' },
    { n: 5, title: 'Base64 decode', desc: 'Decode to raw binary buffer' },
    { n: 6, title: 'XOR decrypt', desc: 'Apply XOR with key + constant' },
    { n: 7, title: 'Plaintext', desc: '.env scanner, credential harvester, C2 exfil, self-deletion' },
    { n: 8, title: 'Conclusion', desc: '"This is exactly how axios@1.14.1 was attacked on March 31, 2026"' },
  ];
  return (
    <div className="ld-deob-steps">
      {steps.map(s => (
        <div key={s.n} className="ld-deob-step">
          <span className="ld-deob-num">{s.n}</span>
          <div>
            <strong>{s.title}</strong>
            <p>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhaseCard({ phase, isOpen, onToggle }) {
  const colorVar = `var(--accent-${phase.color})`;

  return (
    <div className={`ld-phase${isOpen ? ' open' : ''}`} style={{ '--phase-color': colorVar }}>
      <div className="ld-phase-header" onClick={onToggle}>
        <div className="ld-phase-num">{phase.num}</div>
        <div className="ld-phase-icon" style={{ color: colorVar }}>{phase.icon}</div>
        <div className="ld-phase-info">
          <h3>{phase.title}</h3>
          <span className="ld-phase-sub">{phase.subtitle}</span>
        </div>
        <FiChevronDown className={`ld-phase-chevron${isOpen ? ' open' : ''}`} />
      </div>

      {isOpen && (
        <div className="ld-phase-body">
          <div className="ld-narrator">{phase.narrator}</div>

          {phase.steps.map((step, i) => (
            <div key={i} className="ld-step">
              <div className="ld-step-label">
                <span className="ld-step-dot" />
                {step.label}
              </div>
              {step.code && (
                <div className="ld-step-code-wrap">
                  <CopyButton text={step.code} />
                  <CodeBlock code={step.code} language={step.lang || 'bash'} filename={step.label} />
                </div>
              )}
              {step.note && <div className="ld-step-note">{step.note}</div>}
              {step.dashboard && <DashboardMock />}
              {step.deobSteps && <DeobSteps />}
            </div>
          ))}

          {phase.defenses && (
            <div className="ld-defenses">
              {phase.defenses.map((d, i) => (
                <div key={i} className="ld-defense-item">
                  <span className="ld-defense-num">{i + 1}</span>
                  <div>
                    <code>{d.cmd}</code>
                    <p>{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {phase.keyTalkingPoint && (
            <div className="ld-talking-point">
              <strong>Key talking point</strong>
              <p>{phase.keyTalkingPoint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LiveDemo() {
  const [openId, setOpenId] = useState('publish');

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-tag">Live Session</div>
        <h1>Live Demo Walkthrough</h1>
        <p>
          Step-by-step instructions to execute the full supply chain attack demo &mdash;
          from publishing malicious packages to exfiltrating secrets to reverse engineering the payload.
        </p>
      </div>

      <div className="ld-flow-overview">
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-red)' }}>
          <span>00</span>Publish
        </div>
        <span className="ld-flow-arrow">&rarr;</span>
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-cyan)' }}>
          <span>01</span>Registry
        </div>
        <span className="ld-flow-arrow">&rarr;</span>
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-amber)' }}>
          <span>02</span>Victim
        </div>
        <span className="ld-flow-arrow">&rarr;</span>
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-red)' }}>
          <span>03</span>Reveal
        </div>
        <span className="ld-flow-arrow">&rarr;</span>
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-purple)' }}>
          <span>04</span>Forensics
        </div>
        <span className="ld-flow-arrow">&rarr;</span>
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-cyan)' }}>
          <span>05</span>Reverse
        </div>
        <span className="ld-flow-arrow">&rarr;</span>
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-green)' }}>
          <span>06</span>Defense
        </div>
        <span className="ld-flow-arrow">&rarr;</span>
        <div className="ld-flow-item" style={{ '--fc': 'var(--accent-amber)' }}>
          <span>07</span>Cleanup
        </div>
      </div>

      <div className="ld-prereq">
        <h4>Prerequisites</h4>
        <ul>
          <li>npm account with publishing access (<code>npm login</code>)</li>
          <li>C2 server deployed at <code>https://csec-c2-server.onrender.com</code></li>
          <li>Two machines or terminals (attacker + victim)</li>
        </ul>
      </div>

      <div className="ld-phases">
        {phases.map(phase => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isOpen={openId === phase.id}
            onToggle={() => toggle(phase.id)}
          />
        ))}
      </div>
    </div>
  );
}
