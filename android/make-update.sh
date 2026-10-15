#!/usr/bin/env bash
# Makes an over-the-air web bundle: bump public/version.json, `npm run build`, then run this.
# Upload the two files from android/update-out/ to the folder that UPDATE_BASE_URL points to.
set -euo pipefail
cd "$(dirname "$0")/.."
V=$(node -p "require('./dist-single/version.json').version")
mkdir -p android/update-out && rm -f android/update-out/*
(cd dist-single && zip -q "../android/update-out/bundle-$V.zip" index.html version.json)
S=$(sha256sum "android/update-out/bundle-$V.zip" | cut -d' ' -f1)
echo "{\"version\":$V,\"zip\":\"bundle-$V.zip\",\"sha256\":\"$S\"}" > android/update-out/version.json
cat android/update-out/version.json
