# 📦 How to Build & Publish Falcone SDK

## Step 1: Prepare Your SDK

Your SDK structure is already good:

```
falcone-sdk/
├── index.js              # Main entry point
├── package.json          # Package metadata
├── README-NEW.md         # Documentation
├── lib/
│   ├── protect.js        # Pay-per-call middleware
│   ├── protectEscrow.js  # Prepaid escrow middleware
│   └── register.js       # API registration
├── examples/
│   ├── payper-example.js # Pay-per-call example
│   └── escrow-example.js # Prepaid escrow example
└── bin/
    └── cli.js            # CLI tool
```

## Step 2: Test Your SDK Locally

Before publishing, test it locally:

### Option A: Using `npm link`

```bash
# In falcone-sdk folder
cd cosmos-style-interchain-ui/falcone-sdk
npm link

# In your test project
cd ../test-project
npm link @anshu007/falcone-sdk

# Now you can use it
const { protect, protectWithEscrow } = require('@anshu007/falcone-sdk');
```

### Option B: Using local path

```bash
# In your test project
npm install ../falcone-sdk
```

## Step 3: Create npm Account

If you don't have one:

```bash
npm adduser
# Enter username, password, email
```

Or login if you already have an account:

```bash
npm login
```

## Step 4: Update package.json

Make sure these fields are correct:

```json
{
  "name": "@anshu007/falcone-sdk",
  "version": "2.0.0",
  "description": "Monetize your APIs with Stellar payments",
  "main": "index.js",
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/anshuthecoder/-The-Falcons.git"
  },
  "keywords": [
    "stellar",
    "api",
    "monetization",
    "payment",
    "xlm",
    "blockchain",
    "express",
    "middleware",
    "escrow",
    "prepaid"
  ]
}
```

## Step 5: Add .npmignore

Create `.npmignore` to exclude unnecessary files:

```
# Development files
node_modules/
.env
.env.*
*.log

# Test files
test/
examples/
*.test.js

# Documentation drafts
README-NEW.md
docs/

# IDE
.vscode/
.idea/
*.swp
```

## Step 6: Publish to npm

```bash
# Make sure you're in the SDK folder
cd cosmos-style-interchain-ui/falcone-sdk

# Test the package
npm pack
# This creates a .tgz file you can inspect

# Publish to npm
npm publish --access public

# For scoped packages like @anshu007/falcone-sdk
npm publish --access public
```

## Step 7: Version Updates

When you make changes, update the version:

```bash
# Patch update (2.0.0 → 2.0.1)
npm version patch

# Minor update (2.0.0 → 2.1.0)
npm version minor

# Major update (2.0.0 → 3.0.0)
npm version major

# Then publish
npm publish
```

## Step 8: Users Install Your SDK

Once published, anyone can install:

```bash
npm install @anshu007/falcone-sdk
```

## Alternative: GitHub Package Registry

If you want to publish to GitHub instead:

```bash
# Login to GitHub Packages
npm login --registry=https://npm.pkg.github.com

# Update package.json
{
  "name": "@anshuthecoder/falcone-sdk",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}

# Publish
npm publish
```

## Quick Commands Reference

```bash
# 1. Setup
cd cosmos-style-interchain-ui/falcone-sdk
npm login

# 2. Test locally
npm link
cd ../test-project
npm link @anshu007/falcone-sdk

# 3. Publish
npm publish --access public

# 4. Update version
npm version patch  # or minor/major
npm publish

# 5. Unpublish (within 72 hours)
npm unpublish @anshu007/falcone-sdk@2.0.0
```

## Important Files Checklist

✅ **package.json** - Correct name, version, main file
✅ **index.js** - Exports protect and protectWithEscrow
✅ **README.md** - Usage documentation
✅ **LICENSE** - MIT or your choice
✅ **.npmignore** - Exclude dev files
✅ **lib/** - All middleware files
✅ **examples/** - Example code (optional)

## Testing Before Publishing

Create a simple test:

```javascript
// test.js
const { protect, protectWithEscrow } = require("./index");
const express = require("express");

const app = express();

// Test pay-per-call
app.get(
  "/test1",
  protect({
    price: { amount: "5", asset: "XLM" },
    receiver: "GXXXXX...",
  }),
  (req, res) => {
    res.json({ success: true });
  },
);

// Test escrow
app.get(
  "/test2",
  protectWithEscrow({
    apiId: "test-api",
    apiOwnerId: "GXXXXX...",
    pricePerCall: 2,
  }),
  (req, res) => {
    res.json({ success: true });
  },
);

console.log("✅ SDK loaded successfully");
app.listen(5000, () => console.log("✅ Test server running"));
```

Run test:

```bash
node test.js
```

## Final Checklist Before Publishing

- [ ] README.md has clear examples
- [ ] package.json has correct version
- [ ] All dependencies listed
- [ ] No .env files included
- [ ] Examples work
- [ ] npm login successful
- [ ] Git repository linked
- [ ] License file present

## After Publishing

Share your SDK:

```
npm install @anshu007/falcone-sdk

GitHub: https://github.com/anshuthecoder/-The-Falcons
npm: https://www.npmjs.com/package/@anshu007/falcone-sdk
```

Done! 🚀
