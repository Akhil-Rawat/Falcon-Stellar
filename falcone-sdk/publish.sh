#!/bin/bash

# 🚀 Quick Publish Script for Falcone SDK

echo "📦 Falcone SDK Publishing Guide"
echo "================================"
echo ""

# Step 1: Test SDK
echo "Step 1: Testing SDK..."
node test-sdk.js

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Fix errors before publishing."
    exit 1
fi

echo ""
echo "Step 2: Login to npm"
echo "Run: npm login"
echo "(Enter your npm username, password, and email)"
echo ""

# For Windows users - provide PowerShell commands
echo "Windows PowerShell commands:"
echo "----------------------------"
echo "# 1. Test SDK"
echo "node test-sdk.js"
echo ""
echo "# 2. Login to npm (if not already)"
echo "npm login"
echo ""
echo "# 3. Check if logged in"
echo "npm whoami"
echo ""
echo "# 4. Test package (creates .tgz file)"
echo "npm pack"
echo ""
echo "# 5. Publish to npm"
echo "npm publish --access public"
echo ""
echo "# 6. Verify published"
echo "npm view @anshu007/falcone-sdk"
echo ""
echo "================================"
echo "📚 After publishing, users can install with:"
echo "npm install @anshu007/falcone-sdk"
