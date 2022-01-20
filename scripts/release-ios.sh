#!/bin/bash

set -e

echo "Enter Git Tag"
read -r TAG

echo "update CFBundleShortVersionString"
plutil -replace CFBundleShortVersionString -string "${TAG:1:5}" ./ios/App/App/Info.plist
git add .
git commit -m "$TAG"
echo "build iOS"
yarn build:ios
echo "fastlane iOS"
bundle exec fastlane ios beta