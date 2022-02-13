import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { Mnemonic } from 'ldk';
import type { MasterPublicKey } from 'ldk/dist/identity/masterpubkey';
import type { NetworkString } from 'tdex-sdk';
import {
  masterPubKeyRestorerFromEsplora,
  masterPubKeyRestorerFromState,
  mnemonicRestorerFromEsplora,
  mnemonicRestorerFromState,
} from 'tdex-sdk';

import { getLastUsedIndexesInStorage } from '../../utils/storage-helper';
import {mempoolExplorerEndpoints} from '../config';

export type RecommendedFeesResult = {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  minimumFee: number;
};

export const getRecommendedFees = async (network: NetworkString): Promise<RecommendedFeesResult> => {
  const defaultFees : RecommendedFeesResult  = {
    fastestFee: 0.1,
    halfHourFee: 0.1,
    hourFee: 0.1,
    minimumFee: 1
  }

  let endpoint = mempoolExplorerEndpoints.liquid.explorerLiquidAPI;

  if (network === 'testnet'){
    endpoint = mempoolExplorerEndpoints.testnet.explorerLiquidAPI;
  }

  if (network === 'regtest'){
    return defaultFees;
  }

  try {
    const response = await axios.get(`${endpoint}/v1/fees/recommended/`);
    return response.data;
  } catch (err) {
    console.error(err);
    return defaultFees;
  }
}


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
