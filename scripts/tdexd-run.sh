#!/bin/bash

set -e

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

sleep 10

echo "starting oceand"
echo ""

mkdir -p oceand

docker run -it -u 0:0 -d --name oceand \
  -p 18000:18000 \
  -v "$(pwd)/oceand:/home/ocean/.oceand" \
  -e OCEAN_LOG_LEVEL=5 \
  -e OCEAN_NO_TLS=true \
  -e OCEAN_NETWORK="regtest" \
  -e OCEAN_NO_PROFILER=true \
  -e OCEAN_ELECTRUM_URL=tcp://electrs-liquid:50001 \
  -e OCEAN_UTXO_EXPIRY_DURATION_IN_SECONDS=60 \
  -e OCEAN_DB_TYPE=badger \
  --network="nigiri" \
  ghcr.io/vulpemventures/oceand:v0.1.17

echo "starting tdexd"
echo ""

mkdir -p tdexd


docker run -it -u 0:0 -d --name tdexd \
  -p 9945:9945 -p 9000:9000 \
  -v "$(pwd)/tdexd:/home/tdex/.tdex-daemon" \
  -e TDEX_BASE_ASSET="$TDEX_BASE_ASSET" \
  -e TDEX_LOG_LEVEL=5 \
  -e TDEX_WALLET_ADDR=oceand:18000 \
  --network="nigiri" \
  ghcr.io/tdex-network/tdexd:v1.0.1

echo ""
echo "init wallet"

tdex='docker exec -it tdexd tdex '
$tdex config init

mnemonic=$($tdex genseed | grep "\S")
$tdex init --seed "${mnemonic}" --password password &>/dev/null

echo ""
echo "unlocking wallet"

$tdex unlock --password password &>/dev/null
