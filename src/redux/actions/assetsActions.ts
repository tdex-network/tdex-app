import { AssetConfig } from '../../utils/constants';

// SET_ASSET update the state after fetching from registry.
export const SET_ASSET = 'SET_ASSET';
// ADD_ASSET is used when sagas encounter new assets.
export const ADD_ASSET = 'ADD_ASSET';

export const setAsset = (asset: AssetConfig) => {
  return {
    type: SET_ASSET,
    payload: asset,
  };
};

export const addAsset = (assetHash: string) => {
  return {
    type: ADD_ASSET,
    payload: assetHash,
  };
};
