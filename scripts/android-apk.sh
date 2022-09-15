#!/bin/bash

set -e

# Build
cd android
chmod +x ./gradlew
./gradlew clean
./gradlew assemble
cd ..

# Sign
# On MacOS: /Users/xxx/Library/Android/sdk/build-tools/32.0.0/apksigner
apksigner sign \
  --ks ./tdex-app-release-key.keystore \
  --out ./android/app/build/outputs/apk/release/app-release-signed.apk \
  ./android/app/build/outputs/apk/release/app-release-unsigned.apk
