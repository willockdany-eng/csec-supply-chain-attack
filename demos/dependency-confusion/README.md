# Dependency Confusion Attack Demo

This demo shows how dependency confusion works using a local npm registry (Verdaccio).

## Prerequisites

- Node.js 16+ and npm
- Verdaccio (local npm registry)

## Setup

### Step 1: Install and Start Verdaccio

```bash
npm install -g verdaccio
verdaccio &
```

Verdaccio will start on `http://localhost:4873`.

### Step 2: Create a Verdaccio User

```bash
npm adduser --registry http://localhost:4873
# Enter any username/password/email -- this is local
```

### Step 3: Publish the "Legitimate" Private Package

```bash
cd private-package
npm publish --registry http://localhost:4873
```

This publishes `mycompany-internal-utils@1.2.3` to your local registry.

### Step 4: Publish the "Malicious" Package (Higher Version)

```bash
cd ../malicious-package
npm publish --registry http://localhost:4873
```

This publishes `mycompany-internal-utils@99.0.0` to the same registry (simulating a public registry).

### Step 5: Install in the Victim App

```bash
cd ../victim-app
npm install --registry http://localhost:4873
```

**Observe what happens:**
- npm sees two versions: `1.2.3` and `99.0.0`
- The `^1.0.0` version range allows ANY version >= 1.0.0
- npm installs `99.0.0` (the malicious one) because it's higher
- The `preinstall` script in the malicious package runs automatically
- System information is collected (simulated exfiltration)

### Step 6: Run the Victim App

```bash
node app.js
```

Notice the output says "MALICIOUS package v99.0.0" instead of "LEGITIMATE internal package v1.2.3".

## What This Demonstrates

1. **Version resolution attack:** npm picks the highest available version
2. **Automatic code execution:** The `preinstall` hook runs without user consent
3. **Data collection:** System info and environment variables are harvested
4. **Stealth:** The package still exports working functions (the app doesn't crash)

## How to Defend Against This

1. **Use scoped packages:** `@mycompany/internal-utils` -- scopes are namespaced
2. **Configure .npmrc:** Force npm to fetch specific packages from your private registry only
3. **Pin exact versions:** Use `1.2.3` instead of `^1.2.3` in package.json
4. **Always commit package-lock.json:** Lockfiles pin exact resolved versions
5. **Use `--ignore-scripts`:** Prevents lifecycle hooks from running during install
6. **Reserve names:** Publish placeholder packages on public npm with your internal names

## Cleanup

```bash
# Stop Verdaccio
kill %1

# Remove installed packages
cd victim-app && rm -rf node_modules package-lock.json
```



