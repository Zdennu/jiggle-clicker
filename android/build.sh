#!/usr/bin/env bash
# Builds a debug-signed APK without Gradle: aapt2 + javac + d8 + apksigner.  Needs JDK 17+ and
# ANDROID_SDK (build-tools;34.0.0, platforms;android-34). Run `npm run build` first.
set -euo pipefail
cd "$(dirname "$0")"
SDK=${ANDROID_SDK:-/opt/android-sdk}; BT=$SDK/build-tools/34.0.0; JAR=$SDK/platforms/android-34/android.jar
OUT=${1:-../jiggle-clicker.apk}
rm -rf build && mkdir -p build/res build/classes build/assets/www build/dex
cp ../dist-single/index.html ../dist-single/version.json build/assets/www/
$BT/aapt2 compile --dir res -o build/res/res.zip
$BT/aapt2 link -o build/unsigned.apk -I $JAR --manifest AndroidManifest.xml -A build/assets build/res/res.zip --java build/gen --auto-add-overlay
javac --release 8 -Xlint:-options -nowarn -cp $JAR -d build/classes $(find src build/gen -name '*.java')
$BT/d8 --min-api 24 --lib $JAR --output build/dex $(find build/classes -name '*.class')
(cd build/dex && zip -q ../unsigned.apk classes.dex)
$BT/zipalign -f -p 4 build/unsigned.apk build/aligned.apk
[ -f debug.keystore ] || keytool -genkeypair -keystore debug.keystore -storepass android -keypass android -alias androiddebugkey -dname "CN=Android Debug,O=Android,C=US" -keyalg RSA -keysize 2048 -validity 10000 >/dev/null 2>&1
$BT/apksigner sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android --out "$OUT" build/aligned.apk
$BT/apksigner verify --print-certs "$OUT" | head -2
