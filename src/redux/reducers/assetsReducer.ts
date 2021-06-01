import type { AssetConfig } from '../../utils/constants';
import { MAIN_ASSETS } from '../../utils/constants';
import type { ActionType } from '../../utils/types';
import { SET_ASSET } from '../actions/assetsActions';

type AssetsState = Record<string, AssetConfig>;

const assetsReducer = (
  state: AssetsState = initialAssets(),
  action: ActionType,
): AssetsState => {
  switch (action.type) {
    case SET_ASSET: {
      return {
        ...state,
        [action.payload.assetHash]: action.payload,
      };
    }
    default:
      return state;
  }
};

// get the MAIN_ASSETS from constant file
function initialAssets(): Record<string, AssetConfig> {
  const result: Record<string, AssetConfig> = {};
  for (const assetConf of MAIN_ASSETS) {
    result[assetConf.assetHash] = assetConf;
  }
  return result;
}

export default assetsReducer;
