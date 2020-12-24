import { ActionType } from '../../../utils/types';

export const SHOW_SEARCH = 'SHOW_SEARCH';
export const HIDE_SEARCH = 'HIDE_SEARCH';
export const SET_SEARCH_ASSET_LIST = 'SET_SEARCH_ASSET_LIST';
export const SEARCH_ASSET = 'SEARCH_ASSET';

export const showSearch = (party: string): ActionType => {
  return {
    type: SHOW_SEARCH,
    payload: party,
  };
};

export const hideSearch = (): ActionType => {
  return {
    type: HIDE_SEARCH,
  };
};

export const setSearchAssetList = (assets: Array<string>): ActionType => {
  return {
    type: SET_SEARCH_ASSET_LIST,
    payload: assets,
  };
};

export const searchAsset = (query: string): ActionType => {
  return {
    type: SEARCH_ASSET,
    payload: query,
  };
};
