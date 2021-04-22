import { Storage } from '@capacitor/core';
import { defaultProvider } from '../config';
import { Mnemonic } from 'ldk';
import axios from 'axios';

export const axiosProviderObject = axios.create({
  baseURL: defaultProvider.endpoint,
});

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
