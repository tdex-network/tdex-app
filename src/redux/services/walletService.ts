import { Storage } from '@capacitor/core';
import { network, provider } from '../config';
import {
  AddressInterface,
  IdentityType,
  IdentityOpts,
  Mnemonic,
  EsploraIdentityRestorer,
} from 'tdex-sdk';
import { IdentityRestorerFromState } from '../../utils/identity-restorer';
import axios from 'axios';

export const coinGeckoUrl = 'https://api.coingecko.com/api/v3';

export const axiosProviderObject = axios.create({ baseURL: provider.endpoint });
export const axiosCoinGeckoObject = axios.create({ baseURL: coinGeckoUrl });

export const getAssetsRequest = (
  path: string,
  explorerUrlValue: string,
  options?: any
) => {
  return axios.create({ baseURL: explorerUrlValue }).request({
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

export function prepareIdentityOpts(
  mnemonic: string,
  addresses?: Array<AddressInterface>
): IdentityOpts {
  return {
    chain: network.chain,
    type: IdentityType.Mnemonic,
    value: {
      mnemonic,
    },
    initializeFromRestorer: true,
    restorer: addresses
      ? new IdentityRestorerFromState(addresses)
      : new EsploraIdentityRestorer(network.explorer),
  };
}

export function getIdentity(mnemonic: string, addresses?: Array<any>) {
  return new Mnemonic(prepareIdentityOpts(mnemonic, addresses));
}

export const getWallet = async (): Promise<{ value: string }> => {
  return Storage.get({ key: 'wallet' });
};

export const getAddress = async (): Promise<{ value: string }> => {
  return Storage.get({ key: 'address' });
};

export const restoreWallet = async (identity: any): Promise<any> => {
  return identity.isRestored;
};

export const signTx = async (identity: any, unsignedTx: any): Promise<any> => {
  return identity.signPset(unsignedTx);
};

export async function broadcastTx(
  hex: string,
  explorerUrlValue: string
): Promise<string> {
  try {
    const response = await axios.post(`${explorerUrlValue}/tx`, hex);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getCachedAddresses() {
  return Storage.get({ key: 'addresses' }).then((response) =>
    JSON.parse(response.value)
  );
}
