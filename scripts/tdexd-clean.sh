#!/bin/bash

set -e

docker stop oceand
docker stop tdexd
docker rm oceand
docker rm tdexd
sudo rm -rf ./tdexd
sudo rm -rf ./oceand
