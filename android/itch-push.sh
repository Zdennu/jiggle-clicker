#!/usr/bin/env bash
# Publish a web update to itch (the Android app picks it up on next launch):
#   1) bump public/version.json  2) npm run build  3) BUTLER_API_KEY=... ./android/itch-push.sh
set -euo pipefail
cd "$(dirname "$0")/.."
V=$(node -p "require('./dist-single/version.json').version")
${BUTLER:-butler} push dist-single uumar/jiggle-clicker:html5 --userversion "$V"
