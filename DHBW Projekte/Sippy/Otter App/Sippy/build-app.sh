#!/bin/bash
#
# build-app.sh — Compile Sippy in release mode and package it as a proper
# macOS .app bundle with Info.plist, AppIcon, and (optional) ad-hoc code
# signature.
#
# Output:  build/Sippy.app
#
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"
APP_NAME="Sippy"
APP_BUNDLE="$BUILD_DIR/$APP_NAME.app"
CONTENTS="$APP_BUNDLE/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"
BUNDLE_ID="com.sippy.SippyApp"
VERSION="1.0"

echo "==> Cleaning previous build"
rm -rf "$APP_BUNDLE"
mkdir -p "$MACOS" "$RESOURCES"

echo "==> Building Sippy (release)"
cd "$PROJECT_ROOT"
swift build -c release --disable-sandbox 2>&1 | tail -12

BINARY_PATH="$(swift build -c release --show-bin-path)"

echo "==> Copying binary"
cp "$BINARY_PATH/$APP_NAME" "$MACOS/$APP_NAME"

# Copy any resources SPM produced (Assets.xcassets, etc.)
if [ -d "$BINARY_PATH/${APP_NAME}_${APP_NAME}.bundle" ]; then
    cp -R "$BINARY_PATH/${APP_NAME}_${APP_NAME}.bundle" "$RESOURCES/"
fi

echo "==> Generating AppIcon"
ICONSET_DIR="$BUILD_DIR/icon-tmp"
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"
"$MACOS/$APP_NAME" --generate-icons "$ICONSET_DIR"
iconutil -c icns "$ICONSET_DIR/Icon.iconset" -o "$RESOURCES/AppIcon.icns"
rm -rf "$ICONSET_DIR"

echo "==> Writing Info.plist"
cat > "$CONTENTS/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>                    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>             <string>${APP_NAME}</string>
    <key>CFBundleExecutable</key>              <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>              <string>${BUNDLE_ID}</string>
    <key>CFBundleVersion</key>                 <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>      <string>${VERSION}</string>
    <key>CFBundlePackageType</key>             <string>APPL</string>
    <key>CFBundleIconFile</key>                <string>AppIcon</string>
    <key>CFBundleSignature</key>               <string>????</string>
    <key>LSMinimumSystemVersion</key>          <string>14.0</string>
    <key>LSApplicationCategoryType</key>       <string>public.app-category.healthcare-fitness</string>
    <key>LSUIElement</key>                     <true/>
    <key>NSHumanReadableCopyright</key>        <string>Sippy — a friendly hydration tracker.</string>
    <key>NSSupportsAutomaticGraphicsSwitching</key><true/>
    <key>NSPrincipalClass</key>                <string>NSApplication</string>
    <key>NSHighResolutionCapable</key>         <true/>
</dict>
</plist>
PLIST

echo "==> PkgInfo"
printf 'APPL????' > "$CONTENTS/PkgInfo"

echo "==> Ad-hoc code signing"
codesign --force --deep --sign - "$APP_BUNDLE" 2>&1 | tail -5 || true

echo ""
echo "Sippy.app built successfully → $APP_BUNDLE"
echo ""
echo "Launch with:  open '$APP_BUNDLE'"
