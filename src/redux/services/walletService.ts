import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { Mnemonic } from 'ldk';
import type { MasterPublicKey } from 'ldk/dist/identity/masterpubkey';
import {
  masterPubKeyRestorerFromEsplora,
  masterPubKeyRestorerFromState,
  mnemonicRestorerFromEsplora,
  mnemonicRestorerFromState,
} from 'tdex-sdk';

import { getLastUsedIndexesInStorage } from '../../utils/storage-helper';

export type RecommendedFeesResult = {
  [targetBlock: string]: number;
};

export const getRecommendedFees = async (explorerLiquidAPIValue: string): Promise<RecommendedFeesResult> => {
  const defaultFees: RecommendedFeesResult = {
    '1': 0.1,
    '10': 0.1,
    '25': 0.1,
  };

  try {
    const response = await axios.get(`${explorerLiquidAPIValue}/fee-estimates`);
    return response.data;
  } catch (err) {
    console.error(err);
    return defaultFees;
  }
};

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

export const restoreFromMnemonic = async (identity: Mnemonic, explorerLiquidAPIValue: string): Promise<void> => {
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
};

export const restoreFromMasterPubKey = async (
  identity: MasterPublicKey,
  explorerLiquidAPIValue: string
): Promise<void> => {
  try {
    const indexes = await getLastUsedIndexesInStorage();
    if (indexes && Object.values(indexes).length) {
      await masterPubKeyRestorerFromState(identity)(indexes);
    } else {
      await masterPubKeyRestorerFromEsplora(identity)({
        gapLimit: 20,
        esploraURL: explorerLiquidAPIValue,
      });
    }
  } catch (err) {
    console.error(err);
  }
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
