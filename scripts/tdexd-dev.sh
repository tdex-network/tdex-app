#!/bin/bash

set -e

tdex='docker exec -it tdexd tdex '
$tdex config init
$tdex init --seed "wrestle actress dirt spice ridge bone depart leisure fruit shoot elite mistake play supply inhale million tennis harvest merit anchor shaft desert organ salute" --password secret
$tdex unlock --password secret

addressfee=$($tdex depositfee | jq -r '.address_with_blinding_key[0].address')
echo $addressfee

feetxid=$(nigiri faucet --liquid $addressfee | grep '^txId: ' | cut -d ':' -f 2 | tr -d ' ')
sleep 5

feevout=$(nigiri rpc --liquid gettransaction $feetxid | jq -r '.details[0].vout')

$tdex claimfee --outpoints '[{"hash":"'$feetxid'", "vout":'$feevout'}]'
sleep 1

addressmarket=$($tdex depositmarket | jq -r '.addresses[0]')
echo $addressmarket

btctxid=$(nigiri faucet --liquid $addressmarket | grep '^txId: ' | cut -d ':' -f 2 | tr -d ' ')
sleep 5

btcvout=$(nigiri rpc --liquid gettransaction $btctxid | jq -r '.details[0].vout')

mintresponse=$(curl -X POST -H 'Content-Type: application/json' -d '{"address":"'$addressmarket'", "amount": 100}' "http://localhost:3001/mint")
sleep 5

shitcoin=$(echo $mintresponse | jq -r '.asset')
shittxid=$(echo $mintresponse | jq -r '.txId')

shitvout=$(nigiri rpc --liquid gettransaction $shittxid | jq -r '.details[0].vout')

$tdex config set base_asset 5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225
$tdex config set quote_asset $shitcoin

$tdex claimmarket --outpoints '[{"hash":"'$btctxid'", "vout":'$btcvout'}, {"hash":"'$shittxid'", "vout":'$shitvout'}]'
sleep 1

$tdex open
