export const defaultPrecision = 8;

export const LBTC_TICKER = 'L-BTC';
export const USDT_TICKER = 'USDT';

export const LBTC_COINGECKOID = 'bitcoin';
export const USDT_COINGECKOID = 'tether';

export interface AssetConfig {
  coinGeckoID?: string;
  ticker: string;
  // assetHash should be unique /!\
  assetHash: string;
}

export const MAIN_ASSETS: AssetConfig[] = [
  {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: LBTC_TICKER,
    assetHash:
      '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
  },
  {
    coinGeckoID: LBTC_COINGECKOID,
    ticker: LBTC_TICKER,
    assetHash:
      '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
  },
  {
    coinGeckoID: USDT_COINGECKOID,
    ticker: USDT_TICKER,
    assetHash:
      'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
  },
];

export function getMainAsset(assetHash: string): AssetConfig | undefined {
  return MAIN_ASSETS.find(
    (assetConfig: AssetConfig) =>
      assetConfig.assetHash.valueOf() === assetHash.valueOf()
  );
}

export function getCoinGeckoIDsToFeed(): string[] {
  const ids = [];
  for (const id of MAIN_ASSETS.map((a) => a.coinGeckoID)) {
    if (id) ids.push(id);
  }
  return ids;
}
