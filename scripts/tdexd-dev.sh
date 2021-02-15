#!/bin/bash

docker stop tdexd && docker rm tdexd
sudo rm -r ./tdexd

docker run -it -d --name tdexd --network="host" --restart unless-stopped -p 9945:9945 -p 9000:9000 -v `pwd`/tdexd:/.tdex-daemon -e TDEX_NETWORK="regtest" -e TDEX_BASE_ASSET="5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225" -e TDEX_EXPLORER_ENDPOINT="http://127.0.0.1:3001"  ghcr.io/tdex-network/tdexd:latest

tdex='docker exec -it tdexd tdex '
$tdex config init
$tdex init --seed "wrestle actress dirt spice ridge bone depart leisure fruit shoot elite mistake play supply inhale million tennis harvest merit anchor shaft desert organ salute" --password secret
$tdex unlock --password secret

addressfee=$($tdex depositfee | jq -r '.address_with_blinding_key[0].address')
nigiri faucet --liquid $addressfee

addressmarket=$($tdex depositmarket | jq -r '.addresses[0]')
nigiri faucet --liquid $addressmarket
shitcoin=$(nigiri mint $addressmarket 100 | grep '^asset: ' | cut -d ':' -f 2 | tr -d ' ')

$tdex config set base_asset 5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225
$tdex config set quote_asset $shitcoin
$tdex open
