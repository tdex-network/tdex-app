# tdex-app
📱 Mobile app for making trades on TDEX 

## ⬇️ Install

* Download iOS from [App Store](https://apps.apple.com/app/truedex-trading-unleashed/id1545948177)
* Download Android from [Play Store](https://play.google.com/store/apps/details?id=io.sevenlabs.app) or install the [APK from Github Releases](https://github.com/TDex-network/tdex-app/releases)


## 🖥 Local Development

Below is a list of commands you will probably find useful for development.

### `yarn serve`

Runs the project in development/watch mode in the browser. Your project will be rebuilt upon changes. 

### `yarn build`

Transpile TypeScript and bundles the app for production to the `build` folder.

### `yarn android`

Runs the app on the Emulator with target Android

### `yarn ios`

Runs the app on the Simulator with target iOS

### `yarn lint`

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

*  Run on Regtest connecting to Nigiri explorer and using regtest LBTC asset hash and mint USDt

```sh
$ yarn tdex:run
```

* Clean

```sh
$ yarn tdex:clean
```

### Pegin in regtest

* Change elements configuration by adding `fedpegscript=51210269e0180bc9e0be7648d6e9c17f3664bc3ebcee40f3a46cf4b42e583e96b911b951ae` and 
  commenting `initialfreecoins=2100000000000000`

* Change LBTC_ASSET.assetHash in `./src/utils/constants.ts` to `056293ee681516f2d61bb7ce63030351d5e02d61aef9fb00d30f27f55d935b18`

```sh
$ nigiri start --liquid
```

* Generate coins for testing

```sh
$ ./script/pegin.sh
```
