#!/bin/bash

set -e

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

bash scripts/tdexd-run.sh

tdex='docker exec -it tdexd tdex '

echo ""
echo "funding fee account with 0.3 LBTC"

addressesfee=$($tdex fee deposit --num-of-addresses 3)
addressfee1=$(echo $addressesfee | jq -r '.addresses[0]')
addressfee2=$(echo $addressesfee | jq -r '.addresses[1]')
addressfee3=$(echo $addressesfee | jq -r '.addresses[2]')

echo ""
echo "fee address 1: ${addressfee1}"
echo "fee address 2: ${addressfee2}"
echo "fee address 3: ${addressfee3}"

sleep 1

nigiri faucet  --liquid ${addressfee1} 0.01
nigiri faucet  --liquid ${addressfee2} 0.01
nigiri faucet  --liquid ${addressfee3} 0.01

echo ""
echo "////////////////////////"
echo "/// LBTC-USDt Market"

echo "mint 10_000_000 USDt"
addressnigiri=$(curl -s -X GET "http://localhost:3001/getnewaddress" | jq -r '.address')
usdt=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressnigiri'", "amount":10000000, "name": "Liquid Tether",
"ticker":"USDt"}' "http://localhost:3001/mint" | jq -r '.asset')
sleep 7

$tdex market new --base-asset $TDEX_BASE_ASSET --quote-asset ${usdt} --base-asset-precision 8 --quote-asset-precision 8 &>/dev/null
$tdex config set base_asset $TDEX_BASE_ASSET &>/dev/null
$tdex config set quote_asset $usdt &>/dev/null

echo ""
echo "market base asset: $TDEX_BASE_ASSET"
echo "market quote asset: ${usdt}"


echo ""
echo "funding market with 1 LBTC and 20k USDt"

addressesmarket=$($tdex market deposit --num-of-addresses 4)
addressmarket0=$(echo $addressesmarket | jq -r '.addresses[0]')
addressmarket1=$(echo $addressesmarket | jq -r '.addresses[1]')
addressmarket2=$(echo $addressesmarket | jq -r '.addresses[2]')
addressmarket3=$(echo $addressesmarket | jq -r '.addresses[3]')

echo ""
echo "market address 0: ${addressmarket0}"
echo "market address 1: ${addressmarket1}"
echo "market address 2: ${addressmarket2}"
echo "market address 3: ${addressmarket3}"

sleep 1

nigiri faucet --liquid $addressmarket0 0.5 $TDEX_BASE_ASSET
nigiri faucet --liquid $addressmarket1 0.5 $TDEX_BASE_ASSET
nigiri faucet --liquid $addressmarket2 10000 $usdt
nigiri faucet --liquid $addressmarket3 10000 $usdt

sleep 7

echo ""
echo "opening market"
$tdex market open

echo ""
echo "////////////////////////"
echo "/// LBTC-LCAD Market"

echo "mint 10_000_000 LCAD"
asset=$(nigiri mint $(nigiri rpc --liquid getnewaddress) 10000000 | grep asset)
lcad=${asset//asset: /}
addressnigiri=$(curl -s -X GET "http://localhost:3001/getnewaddress" | jq -r '.address')
lcad=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressnigiri'", "amount":10000000, "name": "Liquid CAD",
"ticker":"LCAD"}' "http://localhost:3001/mint" | jq -r '.asset')

sleep 7

$tdex market new --base-asset $TDEX_BASE_ASSET --quote-asset ${lcad} --base-asset-precision 8 --quote-asset-precision 8 &>/dev/null
$tdex config set quote_asset $lcad &>/dev/null

echo "market base asset: $TDEX_BASE_ASSET"
echo "market quote asset: ${lcad}"

echo ""
echo "funding market with 1 LBTC and 20k LCAD"

addressesmarket=$($tdex market deposit --num-of-addresses 4)
addressmarket0=$(echo $addressesmarket | jq -r '.addresses[0]')
addressmarket1=$(echo $addressesmarket | jq -r '.addresses[1]')
addressmarket2=$(echo $addressesmarket | jq -r '.addresses[2]')
addressmarket3=$(echo $addressesmarket | jq -r '.addresses[3]')

echo ""
echo "market address 0: ${addressmarket0}"
echo "market address 1: ${addressmarket1}"
echo "market address 2: ${addressmarket2}"
echo "market address 3: ${addressmarket3}"

sleep 1

nigiri faucet --liquid $addressmarket0 0.5 $TDEX_BASE_ASSET
nigiri faucet --liquid $addressmarket1 0.5 $TDEX_BASE_ASSET
nigiri faucet --liquid $addressmarket2 10000 $lcad
nigiri faucet --liquid $addressmarket3 10000 $lcad

sleep 7

echo ""
echo "opening market"
$tdex market open
