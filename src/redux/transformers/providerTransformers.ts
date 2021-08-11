export const marketsToAssetIds = (markets: any[]): unknown[] => {
  return markets
    .map((market) => Object.values(market))
    .reduce((assets, asset) => assets.concat(asset), [])
    .filter((asset, i, assets) => assets.indexOf(asset) === i);
};
