# tdex-app
📱 Mobile app for making trades on TDEX 

## ⬇️ Install

* Download iOS from [TestFlight](https://testflight.apple.com/join/qEvbAuII)
* Download Android via the latest debug [APK from Github Releases](https://github.com/TDex-network/tdex-app/releases)


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

