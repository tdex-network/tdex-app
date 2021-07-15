#!/bin/bash

set -e

echo ""
echo "starting tdexd"

docker run -it -d --name tdexd -v $(pwd)/tdexd:/.tdex-daemon --network="host" -e TDEX_NETWORK="regtest" -e TDEX_BASE_ASSET="5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225" -e TDEX_EXPLORER_ENDPOINT="http://127.0.0.1:3001" -e TDEX_NO_MACAROONS=true ghcr.io/tdex-network/tdexd:latest

echo ""
echo "init wallet"

tdex='docker exec -it tdexd tdex '
$tdex config init --network "regtest" --explorer_url "http://localhost:3001" --no_macaroons
$tdex init --seed "wrestle actress dirt spice ridge bone depart leisure fruit shoot elite mistake play supply inhale million tennis harvest merit anchor shaft desert organ salute" --password secret &>/dev/null

echo ""
echo "unlocking wallet"

$tdex unlock --password secret &>/dev/null

addressfee1=$($tdex depositfee | jq -r '.address_with_blinding_key[0].address')
addressfee2=$($tdex depositfee | jq -r '.address_with_blinding_key[0].address')
addressfee3=$($tdex depositfee | jq -r '.address_with_blinding_key[0].address')

echo ""
echo "fee address 1: ${addressfee1}"
echo "fee address 2: ${addressfee2}"
echo "fee address 3: ${addressfee3}"

feetxid1=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressfee1'", "amount": 0.01}' "http://localhost:3001/faucet" | jq -r '.txId')
sleep 3

feetxid2=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressfee2'", "amount": 0.01}' "http://localhost:3001/faucet" | jq -r '.txId')
sleep 3

feetxid3=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressfee3'", "amount": 0.01}' "http://localhost:3001/faucet" | jq -r '.txId')
sleep 3

feevout1=$(curl -s -X GET "http://localhost:3001/address/$addressfee1/utxo" | jq -r '.[0].vout')
sleep 1

feevout2=$(curl -s -X GET "http://localhost:3001/address/$addressfee2/utxo" | jq -r '.[0].vout')
sleep 1

feevout3=$(curl -s -X GET "http://localhost:3001/address/$addressfee3/utxo" | jq -r '.[0].vout')
sleep 1

echo ""
echo "fee base outpoint 1: ${feetxid1} ${feevout1}"
echo "fee base outpoint 2: ${feetxid2} ${feevout2}"
echo "fee base outpoint 3: ${feetxid3} ${feevout3}"

$tdex claimfee --outpoints '[{"hash":"'$feetxid1'", "index":'$feevout1'}, {"hash":"'$feetxid2'", "index":'$feevout2'}, {"hash":"'$feetxid3'", "index":'$feevout3'}]'
sleep 1

addressesmarket=$($tdex depositmarket --num_of_addresses 4)
addressmarket0=$(echo $addressesmarket | jq -r '.addresses[0]')
addressmarket1=$(echo $addressesmarket | jq -r '.addresses[1]')
addressmarket2=$(echo $addressesmarket | jq -r '.addresses[2]')
addressmarket3=$(echo $addressesmarket | jq -r '.addresses[3]')

echo ""
echo "market address 0: ${addressmarket0}"
echo "market address 1: ${addressmarket1}"
echo "market address 2: ${addressmarket2}"
echo "market address 3: ${addressmarket3}"

btctxid=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket0'", "amount": 10}' "http://localhost:3001/faucet" | jq -r '.txId')
sleep 5

btcvout=$(curl -s -X GET "http://localhost:3001/address/$addressmarket0/utxo" | jq -r '.[0].vout')

echo "market base outpoint: ${btctxid} ${btcvout}"

addressnigiri=$(curl -s -X GET "http://localhost:3001/getnewaddress" | jq -r '.address')
shitcoin=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressnigiri'", "amount":300000, "name": "Liquid Tether", "ticker":"USDt"}' "http://localhost:3001/mint" | jq -r '.asset')
sleep 5

echo "market quote asset: ${shitcoin}"

shittxid1=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket1'", "asset": "'$shitcoin'", "amount": 100000}' "http://localhost:3001/faucet" | jq -r '.txId')
shittxid2=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket2'", "asset": "'$shitcoin'", "amount": 100000}' "http://localhost:3001/faucet" | jq -r '.txId')
shittxid3=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket3'", "asset": "'$shitcoin'", "amount": 100000}' "http://localhost:3001/faucet" | jq -r '.txId')
sleep 5

shitvout1=$(curl -s -X GET "http://localhost:3001/address/$addressmarket1/utxo" | jq -r '.[0].vout')
shitvout2=$(curl -s -X GET "http://localhost:3001/address/$addressmarket2/utxo" | jq -r '.[0].vout')
shitvout3=$(curl -s -X GET "http://localhost:3001/address/$addressmarket3/utxo" | jq -r '.[0].vout')

echo ""
echo "market quote outpoint 1: ${shittxid1} ${shitvout1}"
echo "market quote outpoint 2: ${shittxid2} ${shitvout2}"
echo "market quote outpoint 3: ${shittxid3} ${shitvout3}"

$tdex config set base_asset 5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225 &>/dev/null
$tdex config set quote_asset $shitcoin &>/dev/null

$tdex claimmarket --outpoints '[{"hash":"'$btctxid'", "index":'$btcvout'}, {"hash":"'$shittxid1'", "index":'$shitvout1'}, {"hash":"'$shittxid2'", "index":'$shitvout2'}, {"hash":"'$shittxid3'", "index":'$shitvout3'}]'
sleep 1

echo ""
echo "opening market"
$tdex open

echo '{"market": {"baseAsset": "5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225","quoteAsset": "'$shitcoin'"}} ' >./test/fixtures/trade.integration.json
