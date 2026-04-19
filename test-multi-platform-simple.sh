#!/bin/bash

# FASE v4.0.0 - Simple Multi-Platform Test Script
# Run on each platform to verify basic functionality

set -e

echo "=============================================="
echo "FASE v4.0.0 - Multi-Platform Test"
echo "=============================================="
echo ""

# Platform info
echo "Platform: $(uname -s) $(uname -m)"
echo "Node: $(node --version)"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Test 1: Build exists
echo "Test 1: Build exists..."
if [ -f "dist/install.js" ]; then
    echo "✓ PASS: dist/install.js exists"
else
    echo "✗ FAIL: dist/install.js not found"
    exit 1
fi

# Test 2: New modules exist
echo "Test 2: New modules exist..."
MODULES=(
    "dist/install/providers.js"
    "dist/install/settings.js"
    "dist/install/attribution.js"
    "dist/install/analytics.js"
    "dist/install/hooks.js"
    "dist/install/frontmatter-convert.js"
    "dist/install/uninstall.js"
    "dist/install/index.js"
    "dist/lib/errors.js"
    "dist/lib/logger.js"
)

for mod in "${MODULES[@]}"; do
    if [ -f "$mod" ]; then
        echo "  ✓ $mod"
    else
        echo "  ✗ $mod NOT FOUND"
        exit 1
    fi
done
echo "✓ PASS: All modules exist"

# Test 3: Unit tests pass
echo "Test 3: Unit tests..."
if npm test > /dev/null 2>&1; then
    echo "✓ PASS: Unit tests pass"
else
    echo "✗ FAIL: Unit tests failed"
    exit 1
fi

# Test 4: Package version
echo "Test 4: Package version..."
VERSION=$(node -p "require('./package.json').version")
if [ "$VERSION" = "4.0.0" ]; then
    echo "✓ PASS: Version is 4.0.0"
else
    echo "✗ FAIL: Version is $VERSION (expected 4.0.0)"
    exit 1
fi

# Test 5: CHANGELOG
echo "Test 5: CHANGELOG has v4.0.0..."
if grep -q "## \[4.0.0\]" CHANGELOG.md; then
    echo "✓ PASS: CHANGELOG has v4.0.0 entry"
else
    echo "✗ FAIL: CHANGELOG missing v4.0.0 entry"
    exit 1
fi

echo ""
echo "=============================================="
echo "All tests PASSED ✓"
echo "=============================================="
