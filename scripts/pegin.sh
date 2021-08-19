#!/bin/bash

# In elements config, need to change fedpegscript to `fedpegscript=51210269e0180bc9e0be7648d6e9c17f3664bc3ebcee40f3a46cf4b42e583e96b911b951ae`
# and comment `initialfreecoins=2100000000000000`

set -e

btcMinerAddress=2N7WfHK1ftrTdhWej8rnFNR7guhvhfGWwFR
liquidMinerAddress=el1qqwghjxrw9mehunfk8xf8wzqlapr83jdwmk3kg6a9x3yfvu0kjyzu48p9h500lt7vdfk6hag5t9ucfp0amxdrs9c9fejjp026e

peginAddress=$(eval "nigiri rpc --liquid getpeginaddress | jq -r '.mainchain_address'")
echo "Pegin deposit address: $peginAddress"
sleep 2

depositTxId=$(eval "nigiri faucet $peginAddress 10 | cut -d ':' -f 2 | tr -d ' '")
echo "Deposit txid: $depositTxId"
sleep 2

newBtcBlock=$(eval "nigiri rpc generatetoaddress 1 $btcMinerAddress | jq '.[0]'")
echo "New btc block: $newBtcBlock"
sleep 2

btcTxHex=$(eval "nigiri rpc getrawtransaction $depositTxId")
echo "Bitcoin tx hex: $btcTxHex"
sleep 2

txOutProof=$(eval "nigiri rpc gettxoutproof '[\"$depositTxId\"]'")
echo "TxOutProof: $txOutProof"
sleep 2

claimTxId=$(eval "nigiri rpc --liquid claimpegin $btcTxHex $txOutProof")
echo "Claim txid: $claimTxId"
sleep 2

newLiquidBlock=$(eval "nigiri rpc --liquid generatetoaddress 1 $liquidMinerAddress | jq '.[0]'")
echo "New Liquid block: $newLiquidBlock"
