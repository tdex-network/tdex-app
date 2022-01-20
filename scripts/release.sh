#!/bin/bash

set -e

echo "Enter Git Tag"
read -r TAG

# iOS
echo "update CFBundleShortVersionString"
plutil -replace CFBundleShortVersionString -string "${TAG:1:5}" ./ios/App/App/Info.plist
git add .
git commit -m "$TAG"
echo "build iOS"
yarn build:ios
echo "fastlane iOS"
bundle exec fastlane ios beta

# Android
#echo "update versionName"
#sed -i '' "s/\(versionName[[:space:]]*\)[0-9]*/\\1\"${TAG:1:5}\"/" android/app/build.gradle
# increment versionCode

echo "build android"
yarn build:android
cd android
chmod +x ./gradlew
./gradlew assemble '-Punsigned'
cd ..

git add .
git commit -m "$TAG"
git tag "$TAG"
git push origin "$TAG"
git push origin master