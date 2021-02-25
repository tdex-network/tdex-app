import { Storage } from '@capacitor/core';
import { network, provider } from '../config';
import { AddressInterface, IdentityType, IdentityOpts, Mnemonic } from 'ldk';
import { IdentityRestorerFromState } from '../../utils/identity-restorer';
import axios from 'axios';
import { getMnemonicFromSecureStorage } from '../../utils/storage-helper';

export const axiosProviderObject = axios.create({ baseURL: provider.endpoint });

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

function prepareIdentityOpts(
  mnemonic: string,
  addresses: Array<AddressInterface>
): IdentityOpts {
  return {
    chain: network.chain,
    type: IdentityType.Mnemonic,
    value: {
      mnemonic,
    },
    initializeFromRestorer: true,
    restorer: new IdentityRestorerFromState(addresses),
  };
}

export async function getIdentity(): Promise<Mnemonic> {
  const [mnemonic, cachedAddresses] = await Promise.all([
    getMnemonicFromSecureStorage(),
    getCachedAddresses(),
  ]);
  return new Mnemonic(prepareIdentityOpts(mnemonic, cachedAddresses));
}

export const getAddress = async (): Promise<{ value: string }> => {
  return Storage.get({ key: 'address' });
};

export const waitForRestore = async (identity: Mnemonic): Promise<boolean> => {
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

async function getCachedAddresses(): Promise<AddressInterface[]> {
  const addressesAsJSON = (await Storage.get({ key: 'addresses' })).value;
  if (!addressesAsJSON) return [];
  return JSON.parse(addressesAsJSON);
}
