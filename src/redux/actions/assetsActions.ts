export const GET_ASSETS = 'GET_ASSETS';
export const SET_ASSETS = 'SET_ASSETS';

export const getAssets = (assetIds: any) => {
  return {
    type: GET_ASSETS,
    payload: assetIds,
  };
};

export const setAssets = (assets: any) => {
  return {
    type: SET_ASSETS,
    payload: assets,
  };
};
