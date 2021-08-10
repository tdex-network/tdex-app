#!/bin/bash

set -e

btcMinerAddress=2N7WfHK1ftrTdhWej8rnFNR7guhvhfGWwFR
liquidMinerAddress=el1qqwghjxrw9mehunfk8xf8wzqlapr83jdwmk3kg6a9x3yfvu0kjyzu48p9h500lt7vdfk6hag5t9ucfp0amxdrs9c9fejjp026e

peginAddress=$(eval "nigiri rpc --liquid getpeginaddress | jq -r '.mainchain_address'")
echo "Pegin deposit address: $peginAddress"

depositTxId=$(eval "nigiri faucet $peginAddress 500 | cut -d ':' -f 2 | tr -d ' '")
echo "Deposit txid: $depositTxId"

newBtcBlock=$(eval "nigiri rpc generatetoaddress 1 $btcMinerAddress | jq '.[0]'")
echo "New btc block: $newBtcBlock"

btcTxHex=$(eval "nigiri rpc getrawtransaction $depositTxId")
echo "Bitcoin tx hex: $btcTxHex"

txOutProof=$(eval "nigiri rpc gettxoutproof '[\"$depositTxId\"]'")
echo "TxOutProof: $txOutProof"

claimTxId=$(eval "nigiri rpc --liquid claimpegin $btcTxHex $txOutProof")
echo "Claim txid: $claimTxId"

newLiquidBlock=$(eval "nigiri rpc --liquid generatetoaddress 1 $liquidMinerAddress | jq '.[0]'")
echo "New Liquid block: $newLiquidBlock"
