import { networks } from 'tdex-sdk';
import { network } from '../config';
import { normalizeAssets } from '../transformers/assetsTransformers';
import axios from 'axios';

export async function fetchAssets(assetIds: Array<any>) {
  const assets = [];

  for (const i in assetIds) {
    const assetId = assetIds[i];
    if (assetId === (networks as any)[network.chain].assetHash) {
      assets.push({
        id: assetId,
        name: 'Liquid Bitcoin',
        ticker: 'LBTC',
      });
    } else {
      await axios
        .get(`${network.explorer}/asset/${assetId}`)
        .then((response) => response.data)
        .then((asset) => {
          assets.push({
            id: assetId,
            name: asset.name,
            ticker: asset.ticker,
          });
        });
    }
  }

  return normalizeAssets(assets);
}
