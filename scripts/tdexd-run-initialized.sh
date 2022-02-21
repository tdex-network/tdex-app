#!/bin/bash

set -e

echo ""
echo "starting tdexd"

TDEX_BASE_ASSET="5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225"

while getopts a: flag; do
  case "${flag}" in
  a) TDEX_BASE_ASSET=${OPTARG} ;;
  *)
    echo "usage: $0 [-a TDEX_BASE_ASSET]" >&2
    exit 1
    ;;
  esac
done

echo "TDEX_BASE_ASSET: $TDEX_BASE_ASSET"
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

addressesfee=$($tdex fee deposit --num_of_addresses 3)
addressfee1=$(echo $addressesfee | jq -r '.address_with_blinding_key[0].address')
addressfee2=$(echo $addressesfee | jq -r '.address_with_blinding_key[1].address')
addressfee3=$(echo $addressesfee | jq -r '.address_with_blinding_key[2].address')

echo ""
echo "fee address 1: ${addressfee1}"
echo "fee address 2: ${addressfee2}"
echo "fee address 3: ${addressfee3}"

feetxid1=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressfee1'", "amount": 0.1}' "http://localhost:3001/faucet" | jq -r '.txId')
feetxid2=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressfee2'", "amount": 0.1}' "http://localhost:3001/faucet" | jq -r '.txId')
feetxid3=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressfee3'", "amount": 0.1}' "http://localhost:3001/faucet" | jq -r '.txId')

sleep 7

feevout1=$(curl -s -X GET "http://localhost:3001/address/$addressfee1/utxo" | jq -r '.[0].vout')
feevout2=$(curl -s -X GET "http://localhost:3001/address/$addressfee2/utxo" | jq -r '.[0].vout')
feevout3=$(curl -s -X GET "http://localhost:3001/address/$addressfee3/utxo" | jq -r '.[0].vout')

echo ""
echo "fee base outpoint 1: ${feetxid1} ${feevout1}"
echo "fee base outpoint 2: ${feetxid2} ${feevout2}"
echo "fee base outpoint 3: ${feetxid3} ${feevout3}"

$tdex fee claim --outpoints '[{"hash":"'$feetxid1'", "index":'$feevout1'}, {"hash":"'$feetxid2'", "index":'$feevout2'}, {"hash":"'$feetxid3'", "index":'$feevout3'}]'

echo ""
echo "////////////////////////"
echo "/// LBTC-USDt Market"

echo "mint 10_000_000 USDt"
addressnigiri=$(curl -s -X GET "http://localhost:3001/getnewaddress" | jq -r '.address')
usdt=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressnigiri'", "amount":10000000, "name": "Liquid Tether",
"ticker":"USDt"}' "http://localhost:3001/mint" | jq -r '.asset')
sleep 7

$tdex market new --base_asset $TDEX_BASE_ASSET --quote_asset ${usdt} &>/dev/null
$tdex config set base_asset $TDEX_BASE_ASSET &>/dev/null
$tdex config set quote_asset $usdt &>/dev/null

echo ""
echo "market base asset: $TDEX_BASE_ASSET"
echo "market quote asset: ${usdt}"

addressesmarket=$($tdex market deposit --num_of_addresses 4)
addressmarket0=$(echo $addressesmarket | jq -r '.address_with_blinding_key[0].address')
addressmarket1=$(echo $addressesmarket | jq -r '.address_with_blinding_key[1].address')
addressmarket2=$(echo $addressesmarket | jq -r '.address_with_blinding_key[2].address')
addressmarket3=$(echo $addressesmarket | jq -r '.address_with_blinding_key[3].address')

echo ""
echo "market address 0: ${addressmarket0}"
echo "market address 1: ${addressmarket1}"
echo "market address 2: ${addressmarket2}"
echo "market address 3: ${addressmarket3}"

btctxid=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket0'", "asset": "'$TDEX_BASE_ASSET'", "amount": 100}' "http://localhost:3001/faucet" | jq -r '.txId')
usdttxid1=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket1'", "asset": "'$usdt'", "amount": 1333333}' "http://localhost:3001/faucet" | jq -r '.txId')
usdttxid2=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket2'", "asset": "'$usdt'", "amount": 1333333}' "http://localhost:3001/faucet" | jq -r '.txId')
usdttxid3=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket3'", "asset": "'$usdt'", "amount": 1333333}' "http://localhost:3001/faucet" | jq -r '.txId')
sleep 7

btcvout=$(curl -s -X GET "http://localhost:3001/address/$addressmarket0/utxo" | jq -r '.[0].vout')
usdtvout1=$(curl -s -X GET "http://localhost:3001/address/$addressmarket1/utxo" | jq -r '.[0].vout')
usdtvout2=$(curl -s -X GET "http://localhost:3001/address/$addressmarket2/utxo" | jq -r '.[0].vout')
usdtvout3=$(curl -s -X GET "http://localhost:3001/address/$addressmarket3/utxo" | jq -r '.[0].vout')

echo ""
echo "market base outpoint: ${btctxid} ${btcvout}"
echo "market quote outpoint 1: ${usdttxid1} ${usdtvout1}"
echo "market quote outpoint 2: ${usdttxid2} ${usdtvout2}"
echo "market quote outpoint 3: ${usdttxid3} ${usdtvout3}"

$tdex market claim --outpoints '[{"hash":"'$btctxid'", "index":'$btcvout'}, {"hash":"'$usdttxid1'", "index":'$usdtvout1'},
{"hash":"'$usdttxid2'", "index":'$usdtvout2'}, {"hash":"'$usdttxid3'", "index":'$usdtvout3'}]'

echo ""
echo "opening market"
$tdex market open

echo ""
echo "////////////////////////"
echo "/// LBTC-LCAD Market"

echo "mint 10_000_000 LCAD"
addressnigiri=$(curl -s -X GET "http://localhost:3001/getnewaddress" | jq -r '.address')
lcad=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressnigiri'", "amount":10000000, "name": "Liquid CAD",
"ticker":"LCAD"}' "http://localhost:3001/mint" | jq -r '.asset')
sleep 7

$tdex market new --base_asset $TDEX_BASE_ASSET --quote_asset ${lcad} &>/dev/null
$tdex config set quote_asset $lcad &>/dev/null

echo "market base asset: $TDEX_BASE_ASSET"
echo "market quote asset: ${lcad}"

addressesmarket=$($tdex market deposit --num_of_addresses 4)
addressmarket0=$(echo $addressesmarket | jq -r '.address_with_blinding_key[0].address')
addressmarket1=$(echo $addressesmarket | jq -r '.address_with_blinding_key[1].address')
addressmarket2=$(echo $addressesmarket | jq -r '.address_with_blinding_key[2].address')
addressmarket3=$(echo $addressesmarket | jq -r '.address_with_blinding_key[3].address')

echo ""
echo "market address 0: ${addressmarket0}"
echo "market address 1: ${addressmarket1}"
echo "market address 2: ${addressmarket2}"
echo "market address 3: ${addressmarket3}"

btctxid=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket0'", "asset": "'$TDEX_BASE_ASSET'", "amount": 100}' "http://localhost:3001/faucet" | jq -r '.txId')
lcadtxid1=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket1'", "asset": "'$lcad'", "amount": 1666666}' "http://localhost:3001/faucet" | jq -r '.txId')
lcadtxid2=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket2'", "asset": "'$lcad'", "amount": 1666666}' "http://localhost:3001/faucet" | jq -r '.txId')
lcadtxid3=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket3'", "asset": "'$lcad'", "amount": 1666666}' "http://localhost:3001/faucet" | jq -r '.txId')
sleep 7

btcvout=$(curl -s -X GET "http://localhost:3001/address/$addressmarket0/utxo" | jq -r '.[0].vout')
lcadvout1=$(curl -s -X GET "http://localhost:3001/address/$addressmarket1/utxo" | jq -r '.[0].vout')
lcadvout2=$(curl -s -X GET "http://localhost:3001/address/$addressmarket2/utxo" | jq -r '.[0].vout')
lcadvout3=$(curl -s -X GET "http://localhost:3001/address/$addressmarket3/utxo" | jq -r '.[0].vout')

echo ""
echo "market base outpoint: ${btctxid} ${btcvout}"
echo "market quote outpoint 1: ${lcadtxid1} ${lcadvout1}"
echo "market quote outpoint 2: ${lcadtxid2} ${lcadvout2}"
echo "market quote outpoint 3: ${lcadtxid3} ${lcadvout3}"

$tdex market claim --outpoints '[{"hash":"'$btctxid'", "index":'$btcvout'}, {"hash":"'$lcadtxid1'", "index":'$lcadvout1'},
{"hash":"'$lcadtxid2'",
"index":'$lcadvout2'}, {"hash":"'$lcadtxid3'", "index":'$lcadvout3'}]'

echo ""
echo "opening market"
$tdex market open
