import type { UtxoInterface } from 'ldk';
import type { AnyAction } from 'redux';

import type { ActionType } from '../../utils/types';
import type { Pegins } from '../reducers/btcReducer';

export const SET_UTXO_BTC = 'SET_UTXO_BTC';
export const UPDATE_UTXOS_BTC = 'UPDATE_UTXOS_BTC';
export const SET_CURRENT_BTC_BLOCK_HEIGHT = 'SET_CURRENT_BTC_BLOCK_HEIGHT';
export const WATCH_CURRENT_BTC_BLOCK_HEIGHT = 'WATCH_CURRENT_BTC_BLOCK_HEIGHT';
export const UPSERT_PEGINS = 'UPSERT_PEGINS';
export const CLAIM_PEGINS = 'CLAIM_PEGINS';

/**
 * Add or update a single or multiple pegins
 * @param pegins
 */
export const upsertPegins = (pegins: Pegins): AnyAction => {
  return {
    type: UPSERT_PEGINS,
    payload: { pegins },
  };
};

export const claimPegins = (pegins: Pegins): AnyAction => {
  return {
    type: CLAIM_PEGINS,
    payload: { pegins },
  };
};

export const setCurrentBtcBlockHeight = (
  currentBtcBlockHeight: number,
): ActionType => {
  return {
    type: SET_CURRENT_BTC_BLOCK_HEIGHT,
    payload: currentBtcBlockHeight,
  };
};

export const watchCurrentBtcBlockHeight = (): ActionType => {
  return {
    type: WATCH_CURRENT_BTC_BLOCK_HEIGHT,
  };
};

export const setUtxoBtc = (utxo: UtxoInterface): ActionType => {
  return {
    type: SET_UTXO_BTC,
    payload: utxo,
  };
};

export const updateUtxosBtc = (): ActionType => {
  return {
    type: UPDATE_UTXOS_BTC,
  };
};
