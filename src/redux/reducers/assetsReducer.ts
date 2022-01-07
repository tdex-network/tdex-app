import type { NetworkString } from 'tdex-sdk';

import type { AssetConfig } from '../../utils/constants';
import { MAIN_ASSETS } from '../../utils/constants';
import type { ActionType } from '../../utils/types';
import { RESET_ASSETS, SET_ASSET } from '../actions/assetsActions';

export type AssetsState = Record<string, AssetConfig>;

const assetsReducer = (state: AssetsState = {}, action: ActionType): AssetsState => {
  switch (action.type) {
    case SET_ASSET: {
      return {
        ...state,
        [action.payload.assetHash]: action.payload,
      };
    }
    case RESET_ASSETS: {
      return initialAssets(action.payload.network);
    }
    default:
      return state;
  }
};

// get the MAIN_ASSETS from constant file
function initialAssets(network?: NetworkString): Record<string, AssetConfig> {
  const result: Record<string, AssetConfig> = {};
  for (const assetConf of MAIN_ASSETS[network as NetworkString]) {
    result[assetConf.assetHash] = assetConf;
  }
  return result;
}

export default assetsReducer;
