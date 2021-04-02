#!/bin/bash

set -e

echo "creating wallet"

tdex='docker exec -it tdexd tdex '
$tdex config init --network "regtest"
$tdex init --seed "wrestle actress dirt spice ridge bone depart leisure fruit shoot elite mistake play supply inhale million tennis harvest merit anchor shaft desert organ salute" --password secret &>/dev/null

echo ""
echo "unlocking wallet"

$tdex unlock --password secret &>/dev/null

addressfee=$($tdex depositfee | jq -r '.address_with_blinding_key[0].address')

echo ""
echo "fee address: ${addressfee}"

feetxid=$(nigiri faucet --liquid $addressfee | grep '^txId: ' | cut -d ':' -f 2 | tr -d ' ')
sleep 5

feevout=$(nigiri rpc --liquid gettransaction $feetxid | jq -r '.details[0].vout')
echo "fee outpoint: ${feetxid} ${feevout}"

$tdex claimfee --outpoints '[{"hash":"'$feetxid'", "index":'$feevout'}]'
sleep 1

addressmarket=$($tdex depositmarket | jq -r '.addresses[0]')

echo ""
echo "market address: ${addressmarket}"

btctxid=$(nigiri faucet --liquid $addressmarket | grep '^txId: ' | cut -d ':' -f 2 | tr -d ' ')
sleep 5

btcvout=$(nigiri rpc --liquid gettransaction $btctxid | jq -r '.details[0].vout')

echo "market base outpoint: ${btctxid} ${btcvout}"

mintresponse=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket'", "quantity": 100}' "http://localhost:3001/mint")
sleep 5

shitcoin=$(echo $mintresponse | jq -r '.asset')
shittxid=$(echo $mintresponse | jq -r '.txId')

shitvout=$(nigiri rpc --liquid gettransaction $shittxid | jq -r '.details[0].vout')

shitcoin=$(echo $mintresponse | jq -r '.asset')
echo "market quote asset: ${shitcoin}"
echo "market quote outpoint: ${shittxid} ${shitvout}"

$tdex config set base_asset 5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225 &>/dev/null
$tdex config set quote_asset $shitcoin &>/dev/null

$tdex claimmarket --outpoints '[{"hash":"'$btctxid'", "index":'$btcvout'}, {"hash":"'$shittxid'", "index":'$shitvout'}]'
sleep 1


echo ""
echo "opening market"
$tdex open
