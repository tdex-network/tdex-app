import { network } from '../redux/config';
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
  chain?: 'liquid' | 'regtest';
}

export const LBTC_ASSET: AssetConfig =
  network.chain === 'regtest'
    ? {
        coinGeckoID: LBTC_COINGECKOID,
        ticker: LBTC_TICKER,
        assetHash:
          // FedPegScript => OP_TRUE
          //'5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
          // FedPegScript => 1 pubKey
          '056293ee681516f2d61bb7ce63030351d5e02d61aef9fb00d30f27f55d935b18',
        color: LBTC_COLOR,
        precision: 8,
        chain: 'regtest',
        name: 'Liquid Bitcoin',
      }
    : {
        coinGeckoID: LBTC_COINGECKOID,
        ticker: LBTC_TICKER,
        assetHash:
          '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
        color: LBTC_COLOR,
        precision: 8,
        chain: 'liquid',
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

export const MAIN_ASSETS: AssetConfig[] = [
  LBTC_ASSET,
  {
    coinGeckoID: USDT_COINGECKOID,
    ticker: USDT_TICKER,
    assetHash:
      'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    color: USDT_COLOR,
    precision: 8,
    name: 'Tether USD',
  },
  {
    ticker: LCAD_TICKER,
    assetHash:
      '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
    color: LCAD_COLOR,
    precision: 8,
    name: 'Liquid CAD',
  },
  {
    ticker: BTSE_TICKER,
    assetHash:
      'b00b0ff0b11ebd47f7c6f57614c046dbbd204e84bf01178baf2be3713a206eb7',
    color: BTSE_COLOR,
    precision: 8,
    name: 'BTSE Token',
  },
];

export function getColor(assetHash: string): string | undefined {
  return MAIN_ASSETS.find(
    (assetConfig: AssetConfig) =>
      assetConfig.assetHash.valueOf() === assetHash.valueOf(),
  )?.color;
}

export function getMainAsset(assetHash: string): AssetConfig | undefined {
  return MAIN_ASSETS.find(
    (assetConfig: AssetConfig) =>
      assetConfig.assetHash.valueOf() === assetHash.valueOf(),
  );
}

export function getCoinGeckoIDsToFeed(): string[] {
  const ids = [];
  for (const id of MAIN_ASSETS.map(a => a.coinGeckoID)) {
    if (id) ids.push(id);
  }
  return ids;
}

export const CURRENCIES: CurrencyInterface[] = [
  {
    name: 'euro',
    symbol: '€',
    value: 'eur',
  },
  {
    name: 'dollar',
    symbol: '$',
    value: 'usd',
  },
  {
    name: 'canadian dollar',
    symbol: '$C',
    value: 'cad',
  },
];

export const LBTC_DENOMINATIONS = [
  'L-BTC',
  'L-mBTC',
  'L-bits',
  'L-sats',
] as const;
export type LbtcDenomination = typeof LBTC_DENOMINATIONS[number];

export const TOAST_TIMEOUT_SUCCESS = 800;
export const TOAST_TIMEOUT_FAILURE = 2000;
export const PIN_TIMEOUT_SUCCESS = 800;
export const PIN_TIMEOUT_FAILURE = 2000;

export const FEDPEGSCRIPT_CUSTOM =
  '51210269e0180bc9e0be7648d6e9c17f3664bc3ebcee40f3a46cf4b42e583e96b911b951ae';
