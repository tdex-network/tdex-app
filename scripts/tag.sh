#!/bin/bash

set -e

yarn version

version=$(cat package.json| jq --raw-output .version)

echo "Bump iOS and Android"
yarn bump

git add .
git commit -m "Bump $version"
git push origin master

echo "Push new tag..."
#git tag -a v$version -m "Release v$version"
git push origin v$version

