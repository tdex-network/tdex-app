export const normalizeAssets = (assets: Array<any>) => {
  return {
    byId: {
      ...assets.reduce((accumulator, asset) => {
        const { id, ...rest } = asset;
        accumulator[id] = rest;
        return accumulator;
      }, {}),
    },

    byTicker: {
      ...assets.reduce((accumulator, asset) => {
        const { ticker, ...rest } = asset;
        accumulator[ticker] = rest;
        return accumulator;
      }, {}),
    },
  };
};
