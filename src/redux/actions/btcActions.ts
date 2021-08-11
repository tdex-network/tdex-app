import type { AnyAction } from 'redux';

import type { ActionType } from '../../utils/types';
import type { DepositPeginUtxo, Pegin, Pegins } from '../reducers/btcReducer';

export const SET_DEPOSIT_PEGIN_UTXO = 'SET_DEPOSIT_PEGIN_UTXO';
export const UPDATE_DEPOSIT_PEGIN_UTXOS = 'UPDATE_DEPOSIT_PEGIN_UTXOS';
export const SET_CURRENT_BTC_BLOCK_HEIGHT = 'SET_CURRENT_BTC_BLOCK_HEIGHT';
export const WATCH_CURRENT_BTC_BLOCK_HEIGHT = 'WATCH_CURRENT_BTC_BLOCK_HEIGHT';
export const UPSERT_PEGINS = 'UPSERT_PEGINS';
export const CLAIM_PEGINS = 'CLAIM_PEGINS';
export const RESTORE_PEGIN_FROM_DEPOSIT_ADDRESS = 'RESTORE_PEGIN_FROM_DEPOSIT_ADDRESS';
export const CHECK_IF_CLAIMABLE_PEGIN_UTXO = 'CHECK_IF_CLAIMABLE_PEGIN_UTXO';
export const SET_MODAL_CLAIM_PEGIN = 'SET_MODAL_CLAIM_PEGIN';

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

export const setCurrentBtcBlockHeight = (currentBtcBlockHeight: number): ActionType => {
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

export const checkIfClaimablePeginUtxo = (): ActionType => {
  return {
    type: CHECK_IF_CLAIMABLE_PEGIN_UTXO,
  };
};

export const setDepositPeginUtxo = (utxo: DepositPeginUtxo, depositAddress: Pegin['depositAddress']): ActionType => {
  return {
    type: SET_DEPOSIT_PEGIN_UTXO,
    payload: { utxo, depositAddress },
  };
};

export const updateDepositPeginUtxos = (): ActionType => {
  return {
    type: UPDATE_DEPOSIT_PEGIN_UTXOS,
  };
};

export const restorePeginFromDepositAddress = (depositAddress: string): ActionType => {
  return {
    type: RESTORE_PEGIN_FROM_DEPOSIT_ADDRESS,
    payload: { depositAddress },
  };
};

export const setModalClaimPegin = ({
  isOpen,
  claimScriptToClaim,
}: {
  isOpen?: boolean;
  claimScriptToClaim?: string;
}): ActionType => {
  return {
    type: SET_MODAL_CLAIM_PEGIN,
    payload: { isOpen, claimScriptToClaim },
  };
};
