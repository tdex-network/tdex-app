#!/bin/bash

set -e

echo ""
echo "starting tdexd"

TDEX_BASE_ASSET="5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225"

while getopts a: flag
do
  case "${flag}" in
    a) TDEX_BASE_ASSET=${OPTARG};;
    *) echo "usage: $0 [-a TDEX_BASE_ASSET]" >&2
       exit 1 ;;
  esac
done

echo "TDEX_BASE_ASSET: $TDEX_BASE_ASSET";
echo ""

mkdir -p tdexd

docker run -it -d --name tdexd \
-p 9945:9945 -p 9000:9000 \
-v "$(pwd)/tdexd:/home/user/.tdex-daemon" \
-e TDEX_NO_MACAROONS=false \
-e TDEX_NETWORK="regtest" \
-e TDEX_BASE_ASSET="$TDEX_BASE_ASSET" \
-e TDEX_LOG_LEVEL=5 \
-e TDEX_EXPLORER_ENDPOINT="http://chopsticks-liquid:3000" \
--network="nigiri" \
ghcr.io/tdex-network/tdexd:latest

echo ""
echo "init wallet"

tdex='docker exec -it tdexd tdex '
$tdex config init --network "regtest"

mnemonic=$($tdex genseed | grep "\S")
$tdex init --seed "${mnemonic}" --password secret &>/dev/null

echo ""
echo "unlocking wallet"

$tdex unlock --password secret &>/dev/null
