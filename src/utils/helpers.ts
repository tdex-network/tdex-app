import { Assets } from './constants';

export const getEdgeAsset = (asset_id: string) => {
  return Object.values(Assets).find((item: any) => item.assetHash === asset_id);
};
