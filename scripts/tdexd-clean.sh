#!/bin/bash

set -e

docker stop tdexd
docker rm tdexd
sudo rm -rf ./tdexd
