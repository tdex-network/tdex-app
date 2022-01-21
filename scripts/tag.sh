#!/bin/bash

set -e

yarn version

version=$(cat package.json| jq --raw-output .version)

echo "Bump iOS and Android"
yarn bump

echo "Push new tag..."
git add .
git commit -m "Bump $version"
git push origin master
