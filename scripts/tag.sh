#!/bin/bash

set -e

echo "Enter Git Tag"
read -r TAG

echo "Bump iOS and Android"
fastlane bump

