import type { NetworkString } from 'tdex-sdk';

import type { AssetConfig } from '../../utils/constants';
import type { ActionType } from '../../utils/types';

// SET_ASSET update the state after fetching from registry.
export const SET_ASSET = 'SET_ASSET';
// ADD_ASSET is used when sagas encounter new assets.
export const ADD_ASSET = 'ADD_ASSET';
export const RESET_ASSETS = 'RESET_ASSETS';

export const setAsset = (asset: AssetConfig): ActionType => {
  return {
    type: SET_ASSET,
    payload: asset,
  };
};

export const addAsset = (assetHash: string): ActionType<string> => {
  return {
    type: ADD_ASSET,
    payload: assetHash,
  };
};

export const resetAssets = (network: NetworkString): ActionType<{ network: NetworkString }> => {
  return {
    type: RESET_ASSETS,
    payload: { network },
  };
};
