import * as bitcoinJS from 'bitcoinjs-lib';
import type { NetworkString } from 'tdex-sdk';

import type { CurrencyInterface } from '../redux/reducers/settingsReducer';

export const defaultPrecision = 8;

export const BTC_TICKER = 'BTC';
export const LBTC_TICKER = 'L-BTC';
export const USDT_TICKER = 'USDT';
export const LCAD_TICKER = 'LCAD';
export const BTSE_TICKER = 'BTSE';
// Blockstream Jade voucher
export const BJDE_TICKER = 'B-JDE';

export const LBTC_COINGECKOID = 'bitcoin';
export const USDT_COINGECKOID = 'tether';

export const LBTC_COLOR = '#f7931a';
export const USDT_COLOR = '#50af95';
export const LCAD_COLOR = '#C40C0C';
export const BTSE_COLOR = '#276ed9';

export interface AssetConfig {
  coinGeckoID?: string;
  ticker: string;
  assetHash: string;
  color: string;
  precision: number;
  name: string;
}

export const getLbtcAsset = (network: NetworkString): AssetConfig =>
  (network === 'liquid' && {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: LBTC_TICKER,
    assetHash: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    color: LBTC_COLOR,
    precision: 8,
    name: 'Liquid Bitcoin',
  }) ||
  (network === 'testnet' && {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: 'tL-BTC',
    assetHash: '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49',
    color: LBTC_COLOR,
    precision: 8,
    name: 'Testnet Liquid Bitcoin',
  }) || {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: LBTC_TICKER,
    // Change asset hash to generate new pegin deposit addresses
    assetHash:
      // FedPegScript => OP_TRUE
      '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
    // FedPegScript => 1 pubKey
    //'056293ee681516f2d61bb7ce63030351d5e02d61aef9fb00d30f27f55d935b18',
    color: LBTC_COLOR,
    precision: 8,
    name: 'Liquid Bitcoin',
  };

export const BTC_ASSET: AssetConfig = {
  coinGeckoID: LBTC_COINGECKOID,
  ticker: BTC_TICKER,
  assetHash: '',
  color: LBTC_COLOR,
  precision: 8,
  name: 'Bitcoin',
};

export const MAIN_ASSETS: Record<NetworkString, AssetConfig[]> = {
  liquid: [
    getLbtcAsset('liquid'),
    {
      coinGeckoID: USDT_COINGECKOID,
      ticker: USDT_TICKER,
      assetHash: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
      color: USDT_COLOR,
      precision: 8,
      name: 'Tether USD',
    },
    {
      ticker: LCAD_TICKER,
      assetHash: '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
      color: LCAD_COLOR,
      precision: 8,
      name: 'Liquid CAD',
    },
    {
      ticker: BTSE_TICKER,
      assetHash: 'b00b0ff0b11ebd47f7c6f57614c046dbbd204e84bf01178baf2be3713a206eb7',
      color: BTSE_COLOR,
      precision: 8,
      name: 'BTSE Token',
    },
  ],
  testnet: [
    getLbtcAsset('testnet'),
    {
      coinGeckoID: USDT_COINGECKOID,
      ticker: USDT_TICKER,
      assetHash: 'f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958',
      color: USDT_COLOR,
      precision: 8,
      name: 'Tether USD',
    },
    {
      ticker: LCAD_TICKER,
      assetHash: 'ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926',
      color: LCAD_COLOR,
      precision: 8,
      name: 'Liquid CAD',
    },
    {
      ticker: BTSE_TICKER,
      assetHash: 'b00b0ff0b11ebd47f7c6f57614c046dbbd204e84bf01178baf2be3713a206eb7',
      color: BTSE_COLOR,
      precision: 8,
      name: 'BTSE Token',
    },
  ],
  regtest: [
    getLbtcAsset('regtest'),
    {
      coinGeckoID: USDT_COINGECKOID,
      ticker: USDT_TICKER,
      assetHash: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
      color: USDT_COLOR,
      precision: 8,
      name: 'Tether USD',
    },
    {
      ticker: LCAD_TICKER,
      assetHash: '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
      color: LCAD_COLOR,
      precision: 8,
      name: 'Liquid CAD',
    },
    {
      ticker: BTSE_TICKER,
      assetHash: 'b00b0ff0b11ebd47f7c6f57614c046dbbd204e84bf01178baf2be3713a206eb7',
      color: BTSE_COLOR,
      precision: 8,
      name: 'BTSE Token',
    },
  ],
};

export const getFedPegScript = (network: NetworkString): string =>
  network === 'regtest' ? '51' : '51210269e0180bc9e0be7648d6e9c17f3664bc3ebcee40f3a46cf4b42e583e96b911b951ae';

export function getColor(assetHash: string, network: NetworkString): string | undefined {
  return MAIN_ASSETS[network]?.find(
    (assetConfig: AssetConfig) => assetConfig.assetHash.valueOf() === assetHash.valueOf()
  )?.color;
}

export function getMainAsset(assetHash: string, network: NetworkString): AssetConfig | undefined {
  return MAIN_ASSETS[network]?.find(
    (assetConfig: AssetConfig) => assetConfig.assetHash.valueOf() === assetHash.valueOf()
  );
}

export function getCoinGeckoIDsToFeed(network: NetworkString): string[] {
  const ids = [];
  for (const id of MAIN_ASSETS[network]?.map((a) => a.coinGeckoID)) {
    if (id) ids.push(id);
  }
  return ids;
}

export const CURRENCIES: CurrencyInterface[] = [
  {
    name: 'Euro',
    symbol: '€',
    value: 'eur',
  },
  {
    name: 'US Dollar',
    symbol: '$',
    value: 'usd',
  },
  {
    name: 'Canadian Dollar',
    symbol: '$C',
    value: 'cad',
  },
];

export const LBTC_DENOMINATIONS = ['L-BTC', 'L-mBTC', 'L-bits', 'L-sats'] as const;
export type LbtcDenomination = typeof LBTC_DENOMINATIONS[number];

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
