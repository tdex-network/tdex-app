#!/bin/bash

set -e

echo "Enter Git Tag"
read -r TAG

echo "update versionName"
#sed -i '' "s/\(versionName[[:space:]]*\)[0-9]*/\\1\"${TAG:1:5}\"/" android/app/build.gradle

# increment versionCode