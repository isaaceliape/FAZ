#!/bin/bash
# Pre-commit hook to validate GitHub Pages build before pushing
# This ensures no breaking changes slip through

set -e

echo "🔍 Running GitHub Pages pre-commit validation..."
echo ""

FAILED=0

# 1. Check base tags exist
echo "✓ Checking base tags..."
if ! grep -q '<base href="/FASE/">' www/index.html; then
    echo "❌ ERROR: www/index.html missing <base href=\"/FASE/\">"
    FAILED=1
fi
if ! grep -q '<base href="/FASE/docs/">' docs/index.html; then
    echo "❌ ERROR: docs/index.html missing <base href=\"/FASE/docs/\">"
    FAILED=1
fi
if [ $FAILED -eq 0 ]; then
    echo "✅ Base tags present"
fi
echo ""

# 2. Check version consistency
echo "✓ Checking version consistency..."
PACKAGE_VERSION=$(grep '"version"' package.json | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
WWW_VERSION=$(grep 'v[0-9]\+\.[0-9]\+\.[0-9]\+' www/index.html | head -1 | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+')
DOCS_VERSION=$(grep 'v[0-9]\+\.[0-9]\+\.[0-9]\+' docs/index.html | head -1 | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+')

if [[ "$WWW_VERSION" != "v$PACKAGE_VERSION" ]]; then
    echo "❌ ERROR: www/index.html version ($WWW_VERSION) != package.json ($PACKAGE_VERSION)"
    FAILED=1
fi
if [[ "$DOCS_VERSION" != "v$PACKAGE_VERSION" ]]; then
    echo "❌ ERROR: docs/index.html version ($DOCS_VERSION) != package.json ($PACKAGE_VERSION)"
    FAILED=1
fi
if [ $FAILED -eq 0 ]; then
    echo "✅ All versions match (v$PACKAGE_VERSION)"
fi
echo ""

# 3. Check required files exist
echo "✓ Checking required files..."
FILES_OK=0
required_files=(
    "www/index.html"
    "www/fase-logo.png"
    "www/fonts/0xProto-Regular.woff2"
    "www/fonts/0xProto-Bold.woff2"
    "docs/index.html"
    ".github/workflows/deploy-pages.yml"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ ERROR: Required file missing: $file"
        FAILED=1
    else
        FILES_OK=$((FILES_OK + 1))
    fi
done
if [ $FAILED -eq 0 ]; then
    echo "✅ All ${#required_files[@]} required files present"
fi
echo ""

# 4. Check workflow file syntax
echo "✓ Validating workflow YAML..."
if ! grep -q 'name: Deploy GitHub Pages' .github/workflows/deploy-pages.yml; then
    echo "❌ ERROR: Workflow file missing name"
    FAILED=1
fi
if ! grep -q 'github-pages' .github/workflows/deploy-pages.yml; then
    echo "❌ ERROR: Workflow file missing github-pages configuration"
    FAILED=1
fi
if [ $FAILED -eq 0 ]; then
    echo "✅ Workflow file valid"
fi
echo ""

# 5. Check for common issues
echo "✓ Checking for common issues..."
if grep -q 'fase-logo\.png' www/index.html && ! grep -q 'src="fase-logo\.png"' www/index.html; then
    # Logo is referenced but might not have correct path
    if ! grep -q '<base href="/FASE/">' www/index.html; then
        echo "⚠️  WARNING: Logo reference found but base tag missing"
    fi
fi
echo "✅ No obvious issues found"
echo ""

# Final result
echo "═══════════════════════════════════════════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo "✅ All GitHub Pages checks passed - safe to commit"
    exit 0
else
    echo "❌ GitHub Pages validation FAILED - please fix errors above"
    exit 1
fi
