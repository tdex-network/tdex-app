import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { Mnemonic } from 'ldk';
import { mnemonicRestorerFromEsplora, mnemonicRestorerFromState } from 'tdex-sdk';

import { getLastUsedIndexesInStorage } from '../../utils/storage-helper';

export const getAssetsRequest = (
  path: string,
  explorerLiquidAPIValue: string,
  options?: any
): Promise<AxiosResponse> => {
  return axios.create({ baseURL: explorerLiquidAPIValue }).request({
    method: 'get',
    url: path,
    params: options?.params,
  });
};

export const waitForRestore = async (identity: Mnemonic, explorerLiquidAPIValue: string): Promise<boolean> => {
  try {
    const indexes = await getLastUsedIndexesInStorage();
    if (indexes && Object.values(indexes).length) {
      await mnemonicRestorerFromState(identity)(indexes);
    } else {
      await mnemonicRestorerFromEsplora(identity)({
        gapLimit: 20,
        esploraURL: explorerLiquidAPIValue,
      });
    }
  } catch (err) {
    console.error(err);
  }
  return true;
};

export const signTx = async (identity: any, unsignedTx: any): Promise<any> => {
  return identity.signPset(unsignedTx);
};

export async function broadcastTx(hex: string, explorerLiquidAPIValue: string): Promise<string> {
  try {
    const response = await axios.post(`${explorerLiquidAPIValue}/tx`, hex);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
