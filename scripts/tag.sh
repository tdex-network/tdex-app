#!/bin/bash

set -e

echo "Enter Git Tag"
read -r TAG

git add .
git commit -m "$TAG"
git tag "$TAG"
git push origin "$TAG"
git push origin master