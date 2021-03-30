# tdex-app
📱 Mobile app for making trades on TDEX 

## ⬇️ Install

* Download iOS from [App Store](#)
* Download Android from [Play Store](#) or install the latest [APK from Github Releases](#)


## 🖥 Local Development

Below is a list of commands you will probably find useful for development.

### `npm run serve`

Runs the project in development/watch mode in the browser. Your project will be rebuilt upon changes. 

### `npm run build`

Transpile TypeScript and bundles the app for production to the `build` folder.

### `npm run android`

Runs the app on the Emulator with target Android

### `npm run ios`

Runs the app on the Simulator with target iOS

### `npm run lint`

Runs eslint on the whole project

## Run with a regtest TDex Daemon 

#### Requirements

* Docker/compose

### Nigiri

First, you need a Liquid regtest node to simulate a blockchain enviroment. The fastest way is to download and install [Nigiri CLI](https://github.com/vulpemventures/nigiri)


* Download and install `nigiri` command line interface

```sh
$ curl https://getnigiri.vulpem.com | bash
```

* Close and reopen your terminal, then start Bitcoin and Liquid

```sh
$ nigiri start --liquid
```
**That's it.**
Quickly inspect the Liquid blockchain on http://localhost:5001 for Liquid. The Esplora REST API interface is on http://locahost:3001



### TDex Daemon 

* Pull the tdex daemon container

```sh
$ docker pull ghcr.io/tdex-network/tdexd:latest
```

*  Run on Regtest connecting to Nigiri explorer and using regtest LBTC asset hash.

```sh
docker run -it -d --name tdexd -v `pwd`/tdexd:/.tdex-daemon --network="host" -e TDEX_NETWORK="regtest" -e TDEX_BASE_ASSET="5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225" -e TDEX_EXPLORER_ENDPOINT="http://127.0.0.1:3001"  ghcr.io/tdex-network/tdexd:latest
```

This will mount in `pwd`/tdexd the data directory. After using you can delete it and everything will be deleted.

* Check the Logs

```sh
$ docker logs tdex
INFO[0000] trader interface is listening on :9945
INFO[0000] operator interface is listening on :9945
```

* Add an alias to the TDEX OPERATOR CLI for easiness 

```sh
$ alias tdex='docker exec -it tdexd tdex'
```

Now you are ready to create your first market and start accepting incoming trades.

```sh
# init the cli configuration
$ tdex config init
# generate a new mnemonic
$ SEED=$(tdex genseed)
# init the provider's wallet
$ tdex init --seed $SEED --password secret
# unlock the wallet using the password
$ tdex unlock --password secret
```
Next, we need to fund the **fee account** of our provider. 

```sh
$ tdex depositfee
# the wallet will return a confidential address, we need to send some LBTC to this one
# here, we use nigiri faucet for example
# /!\ REPLACE by your deposit address /!\
$ nigiri faucet --liquid YOUR_FEE_ACCOUNT_ADDRESS_HERE

# claim the deposit transaction
$ tdex claimfee --outpoints '[{"hash": <txid>, "index": <vout>}]'
```

Well, now let's create a market:

```sh
# first create an empty market
$ tdex depositmarket
# this will return an address, we need to send it some LBTC and some ALTCOIN
# again, let's use nigiri for that
# let's fund the market address with LBTC
# LBTC will be the base asset of the market
$ nigiri faucet --liquid YOUR_MARKET_ADDRESS
# Let's generate a new ALTCOIN and send 100 assets to the market address
# The generated altcoin will be the quote_asset
$ nigiri mint YOUR_MARKET_ADDRESS 100
# /!\ Copy the altcoin asset hash in the clipboard!

# claim the deposit transaction
$ tdex claimmarket --outpoints '[{"hash": <txid>, "index": <vout>}, {...}]'
```

We need to open the new market, by default a new market is not tradable.

```sh
# Select the market using `config set`
$ tdex config set base_asset 5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225
$ tdex config set quote_asset ALTCOIN_ASSET_HASH_HERE
# Then make the market tradable
$ tdex open
```

Congrats! The daemon is running and has a tradable market LBTC/ALTCOIN.



