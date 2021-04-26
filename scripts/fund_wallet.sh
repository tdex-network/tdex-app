#!/bin/bash

set -e

echo "Enter Tdex address"
read TDEX_ADDRESS

# Close all
echo "Closing all...wait"
nigiri stop --delete || true
sleep 5

# Open
echo "Running nigiri...wait"
nigiri start --liquid
sleep 5

#
echo "Faucet 20 L-BTC"
nigiri faucet --liquid $TDEX_ADDRESS 20
sleep 5

# USDt
asset=$(eval "nigiri mint $(nigiri rpc --liquid getnewaddress) 100000 'Tether USD' USDt | grep '^asset: ' | cut -d ':' -f 2 | tr -d ' '")
sleep 5
echo ""
echo "Minted asset"
echo $asset
echo ""
echo "Faucet 1000 USDt"
nigiri faucet --liquid $TDEX_ADDRESS 1000 $asset
sleep 5

# LCAD
asset=$(eval "nigiri mint $(nigiri rpc --liquid getnewaddress) 100000 'Liquid CAD' LCAD | grep '^asset: ' | cut -d ':' -f 2 | tr -d ' '")
sleep 5
echo ""
echo "Minted asset"
echo $asset
echo ""
echo "Faucet 1000 LCAD"
nigiri faucet --liquid $TDEX_ADDRESS 1000 $asset
sleep 5

# RAND
asset=$(eval "nigiri mint $(nigiri rpc --liquid getnewaddress) 100000 'Random' RAND | grep '^asset: ' | cut -d ':' -f 2 | tr -d ' '")
sleep 5
echo ""
echo "Minted asset"
echo $asset
echo ""
echo "Faucet 1000 RAND"
nigiri faucet --liquid $TDEX_ADDRESS 1000 $asset
sleep 5

