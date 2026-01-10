#!/bin/bash
# Build script for Chrome and Firefox versions of Instagram Reels Controls

VERSION="1.1.0"
BUILD_DIR="release"

echo "🏗️  Building Instagram Reels Controls v${VERSION} for Chrome and Firefox..."

# Create release directory
mkdir -p "$BUILD_DIR"

# Clean old builds
rm -f "$BUILD_DIR/chrome-v${VERSION}.zip"
rm -f "$BUILD_DIR/firefox-v${VERSION}.zip"

# Files to include (common to both)
COMMON_FILES=(
  "manifest.json"
  "content.js"
  "content.css"
  "popup.html"
  "popup.js"
  "popup.css"
  "icons/icon16.png"
  "icons/icon48.png"
  "icons/icon128.png"
  "README.md"
  "PRIVACY.md"
)

# Build Chrome version
echo "📦 Building Chrome version..."
zip -q "$BUILD_DIR/chrome-v${VERSION}.zip" "${COMMON_FILES[@]}"
echo "✅ Chrome build complete: $BUILD_DIR/chrome-v${VERSION}.zip"

# Build Firefox version
echo "📦 Building Firefox version..."
# Copy manifest.firefox.json as manifest.json for Firefox build
cp manifest.firefox.json manifest.json.temp
mv manifest.json manifest.json.chrome
mv manifest.json.temp manifest.json

zip -q "$BUILD_DIR/firefox-v${VERSION}.zip" "${COMMON_FILES[@]}"

# Restore original manifest
mv manifest.json manifest.json.firefox
mv manifest.json.chrome manifest.json

echo "✅ Firefox build complete: $BUILD_DIR/firefox-v${VERSION}.zip"

# Show file sizes
echo ""
echo "📊 Build summary:"
ls -lh "$BUILD_DIR/"*v${VERSION}.zip | awk '{print "  " $9 " - " $5}'

echo ""
echo "✨ Done! Release packages ready for distribution."
