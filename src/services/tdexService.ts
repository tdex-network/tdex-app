import axios from 'axios';

import type { TDEXMarket, TDEXProvider } from '../store/tdexStore';
import type { NetworkString } from '../utils/constants';

const TDexRegistryMainnet = 'https://raw.githubusercontent.com/TDex-network/tdex-registry/master/registry.json';
const TDexRegistryTestnet = 'https://raw.githubusercontent.com/tdex-network/tdex-registry/testnet/registry.json';

export async function getProvidersFromTDexRegistry(network: NetworkString): Promise<TDEXProvider[]> {
  if (network === 'testnet') {
    return (await axios.get(TDexRegistryTestnet)).data;
  }
  return (await axios.get(TDexRegistryMainnet)).data;
}

// Find all assets in markets tradable with the asset `asset`
export function getTradablesAssets(markets: TDEXMarket[], asset: string): string[] {
  const tradable: string[] = [];
  for (const market of markets) {
    if (asset === market.baseAsset && !tradable.includes(market.quoteAsset)) {
      tradable.push(market.quoteAsset);
    }
    if (asset === market.quoteAsset && !tradable.includes(market.baseAsset)) {
      tradable.push(market.baseAsset);
    }
  }
  return tradable;
}
