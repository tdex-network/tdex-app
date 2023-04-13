import * as bitcoinJS from 'bitcoinjs-lib';

import BtseIcon from '../assets/img/coins/btse.svg';
import LbtcIcon from '../assets/img/coins/lbtc.svg';
import LcadIcon from '../assets/img/coins/lcad.svg';
import UsdtIcon from '../assets/img/coins/usdt.svg';
import type { Asset } from '../store/assetStore';
import type { Currency } from '../store/settingsStore';

export const defaultPrecision = 8;

export type NetworkString = 'liquid' | 'testnet' | 'regtest';

export const BTC_TICKER = 'BTC';
export const LBTC_TICKER: Record<NetworkString, 'L-BTC' | 'tL-BTC'> = {
  liquid: 'L-BTC',
  testnet: 'tL-BTC',
  regtest: 'L-BTC',
};
export const USDT_TICKER = 'USDt';
export const LCAD_TICKER = 'LCAD';
export const BTSE_TICKER = 'BTSE';
// Blockstream Jade voucher
export const BJDE_TICKER = 'B-JDE';

export const LBTC_COINGECKOID = 'bitcoin';
export const USDT_COINGECKOID = 'tether';

export const LBTC_ASSET: Record<NetworkString, Asset> = {
  liquid: {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: LBTC_TICKER['liquid'],
    assetHash: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    precision: 8,
    name: 'Liquid Bitcoin',
  },
  testnet: {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: LBTC_TICKER['testnet'],
    assetHash: '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49',
    precision: 8,
    name: 'Testnet Liquid Bitcoin',
  },
  regtest: {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: LBTC_TICKER['regtest'],
    // Change asset hash to generate new pegin deposit addresses
    assetHash:
      // FedPegScript => OP_TRUE
      '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
    // FedPegScript => 1 pubKey
    //'056293ee681516f2d61bb7ce63030351d5e02d61aef9fb00d30f27f55d935b18',
    precision: 8,
    name: 'Liquid Bitcoin',
  },
};

export const USDT_ASSET: Record<NetworkString, Asset> = {
  liquid: {
    coinGeckoID: USDT_COINGECKOID,
    ticker: USDT_TICKER,
    assetHash: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    precision: 8,
    name: 'Tether USD',
  },
  testnet: {
    coinGeckoID: USDT_COINGECKOID,
    ticker: USDT_TICKER,
    assetHash: 'f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958',
    precision: 8,
    name: 'Tether USD',
  },
  regtest: {
    coinGeckoID: USDT_COINGECKOID,
    ticker: USDT_TICKER,
    assetHash: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    precision: 8,
    name: 'Tether USD',
  },
};

export const LCAD_ASSET: Record<NetworkString, Asset> = {
  liquid: {
    assetHash: '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
    name: 'Liquid CAD',
    precision: 8,
    ticker: LCAD_TICKER,
  },
  testnet: {
    assetHash: 'ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926',
    name: 'Liquid CAD',
    precision: 8,
    ticker: LCAD_TICKER,
  },
  regtest: {
    assetHash: '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
    name: 'Liquid CAD',
    precision: 8,
    ticker: LCAD_TICKER,
  },
};

export const BTSE_ASSET: Record<NetworkString, Asset> = {
  liquid: {
    assetHash: 'b00b0ff0b11ebd47f7c6f57614c046dbbd204e84bf01178baf2be3713a206eb7',
    name: 'BTSE Token',
    precision: 8,
    ticker: BTSE_TICKER,
  },
  testnet: {
    assetHash: 'b00b0ff0b11ebd47f7c6f57614c046dbbd204e84bf01178baf2be3713a206eb7',
    name: 'BTSE Token',
    precision: 8,
    ticker: BTSE_TICKER,
  },
  regtest: {
    assetHash: 'b00b0ff0b11ebd47f7c6f57614c046dbbd204e84bf01178baf2be3713a206eb7',
    name: 'BTSE Token',
    precision: 8,
    ticker: BTSE_TICKER,
  },
};

export const BTC_ASSET: Asset = {
  coinGeckoID: LBTC_COINGECKOID,
  ticker: BTC_TICKER,
  assetHash: '',
  precision: 8,
  name: 'Bitcoin',
};

export const MAIN_ASSETS: Record<NetworkString, Asset[]> = {
  liquid: [LBTC_ASSET['liquid'], USDT_ASSET['liquid'], LCAD_ASSET['liquid'], BTSE_ASSET['liquid']],
  testnet: [LBTC_ASSET['testnet'], USDT_ASSET['testnet'], LCAD_ASSET['testnet'], BTSE_ASSET['testnet']],
  regtest: [LBTC_ASSET['regtest'], USDT_ASSET['regtest'], LCAD_ASSET['regtest'], BTSE_ASSET['regtest']],
};

export const getFedPegScript = (network: NetworkString): string =>
  network === 'regtest' ? '51' : '51210269e0180bc9e0be7648d6e9c17f3664bc3ebcee40f3a46cf4b42e583e96b911b951ae';

export const CURRENCIES: Currency[] = [
  {
    name: 'Euro',
    symbol: '€',
    ticker: 'eur',
  },
  {
    name: 'US Dollar',
    symbol: '$',
    ticker: 'usd',
  },
  {
    name: 'Canadian Dollar',
    symbol: '$C',
    ticker: 'cad',
  },
];

export const LBTC_UNITS = ['L-BTC', 'L-mBTC', 'L-bits', 'L-sats'] as const;
export type LbtcUnit = (typeof LBTC_UNITS)[number];

export const TOAST_TIMEOUT_SUCCESS = 2000;
export const TOAST_TIMEOUT_FAILURE = 2000;
export const PIN_TIMEOUT_SUCCESS = 800;
export const PIN_TIMEOUT_FAILURE = 2000;

export function getBitcoinJSNetwork(chain: NetworkString): bitcoinJS.networks.Network {
  if (chain === 'liquid') {
    return bitcoinJS.networks.bitcoin;
  } else if (chain === 'testnet') {
    return bitcoinJS.networks.testnet;
  } else {
    return bitcoinJS.networks.regtest;
  }
}

// featured assets map: from an asset hash, get local image path
const featuredAssetsMap = new Map<string, string>();
featuredAssetsMap.set(LBTC_ASSET['liquid'].assetHash, LbtcIcon);
featuredAssetsMap.set(LBTC_ASSET['testnet'].assetHash, LbtcIcon);
featuredAssetsMap.set(LBTC_ASSET['regtest'].assetHash, LbtcIcon);
featuredAssetsMap.set(USDT_ASSET['liquid'].assetHash, UsdtIcon);
featuredAssetsMap.set(USDT_ASSET['testnet'].assetHash, UsdtIcon);
featuredAssetsMap.set(LCAD_ASSET['liquid'].assetHash, LcadIcon);
featuredAssetsMap.set(LCAD_ASSET['testnet'].assetHash, LcadIcon);
featuredAssetsMap.set(BTSE_ASSET['liquid'].assetHash, BtseIcon);
featuredAssetsMap.set(BTSE_ASSET['testnet'].assetHash, BtseIcon);

// given an asset hash, return url for image path from mempool
const getRemoteImagePath = (hash: string) => `https://liquid.network/api/v1/asset/${hash}/icon`;

// getter function using to look for assets on testnet and regtest
// and return the correct asset icon path (with asset hash from mainnet)
export function getAssetImagePath(assetHash: string): string {
  const localImagePath = featuredAssetsMap.get(assetHash);
  if (localImagePath) return localImagePath;
  return getRemoteImagePath(assetHash);
}

export const BASE_DERIVATION_PATH_MAINNET = "m/84'/1776'/0'";
export const BASE_DERIVATION_PATH_MAINNET_LEGACY = "m/84'/0'/0'";
export const BASE_DERIVATION_PATH_TESTNET = "m/84'/1'/0'";
export const BASE_DERIVATION_PATH_TESTNET_LEGACY = "m/84'/0'/0'";

export function getBaseDerivationPath(network: NetworkString): { legacy: string; main: string } {
  return network === 'liquid'
    ? { legacy: BASE_DERIVATION_PATH_MAINNET_LEGACY, main: BASE_DERIVATION_PATH_MAINNET }
    : { legacy: BASE_DERIVATION_PATH_TESTNET_LEGACY, main: BASE_DERIVATION_PATH_TESTNET };
}
