import { Storage } from '@capacitor/core';
import { network } from '../config';
import { IdentityType, EsploraIdentityRestorer } from 'tdex-sdk';
import axios from 'axios';

export const coinGeckoUrl = 'https://api.coingecko.com/api/v3';

export const axiosExplorerObject = axios.create({ baseURL: network.explorer });
export const axiosCoinGeckoObject = axios.create({ baseURL: coinGeckoUrl });

export const getAssetsRequest = (path: string, options?: any) => {
  return axiosExplorerObject.request({
    method: 'get',
    url: path,
    params: options?.params,
  });
};

export const getCoinsRequest = (path: string, options?: any) => {
  return axiosCoinGeckoObject.request({
    method: 'get',
    url: path,
    params: options?.params,
  });
};

export function getIdentity(seed: string, initializeFromRestorer: boolean) {
  return {
    chain: network.chain,
    type: IdentityType.Mnemonic,
    value: {
      mnemonic: seed,
    },
    initializeFromRestorer,
    restorer: new EsploraIdentityRestorer(network.explorer),
  };
}

export const getWallet = async (): Promise<{ value: string }> => {
  return Storage.get({ key: 'wallet' });
};

export const getAddress = async (): Promise<{ value: string }> => {
  return Storage.get({ key: 'address' });
};
