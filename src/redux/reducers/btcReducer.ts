import { merge } from 'lodash';
import moment from 'moment';
import { createSelector } from 'reselect';

import { LBTC_ASSET } from '../../utils/constants';
import type { ActionType, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';
import {
  SET_CURRENT_BTC_BLOCK_HEIGHT,
  SET_DEPOSIT_PEGIN_UTXO,
  SET_MODAL_CLAIM_PEGIN,
  UPSERT_PEGINS,
} from '../actions/btcActions';

import { outpointToString } from './walletReducer';

// Deposit pegin utxos
export interface DepositPeginUtxo {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
  // Info added after successful claim
  claimTxId?: string;
}
type Outpoint = string;
export type DepositPeginUtxos = Record<Outpoint, DepositPeginUtxo>;
// Pegin
export interface Pegin {
  // Address generated on deposit screen
  depositAddress: {
    address: string;
    claimScript: string;
    derivationPath: string;
  };
  // Info added after utxo fetching
  depositUtxos?: DepositPeginUtxos;
}
type ClaimScript = string;
export type Pegins = Record<ClaimScript, Pegin>;

export interface BtcState {
  currentBlockHeight: number;
  pegins: Pegins;
  // Global state necessary for modal to be triggered by toast
  modalClaimPegins: { isOpen: boolean; claimScriptToClaim?: string };
}

export const initialState: BtcState = {
  currentBlockHeight: 0,
  pegins: {},
  modalClaimPegins: { isOpen: false, claimScriptToClaim: undefined },
};

function btcReducer(state = initialState, action: ActionType): BtcState {
  switch (action.type) {
    case SET_DEPOSIT_PEGIN_UTXO:
      return upsertDepositUtxoInState(state, action.payload.utxo, action.payload.depositAddress);
    case SET_CURRENT_BTC_BLOCK_HEIGHT: {
      return {
        ...state,
        currentBlockHeight: action.payload,
      };
    }
    case UPSERT_PEGINS: {
      return upsertPeginsInState(state, action.payload.pegins);
    }
    case SET_MODAL_CLAIM_PEGIN: {
      return {
        ...state,
        modalClaimPegins: Object.assign({}, state.modalClaimPegins, action.payload),
      };
    }
    default:
      return state;
  }
}

const upsertDepositUtxoInState = (state: BtcState, utxo: DepositPeginUtxo, depositAddress: Pegin['depositAddress']) => {
  state.pegins[depositAddress.claimScript].depositUtxos = {
    ...state.pegins[depositAddress.claimScript].depositUtxos,
    [outpointToString(utxo)]: utxo,
  };
  return {
    ...state,
    pegins: { ...state.pegins },
  };
};

export const depositPeginUtxosToDisplayTxSelector = createSelector(
  ({ btc }: { btc: BtcState }) => btc.pegins,
  (pegins): TxDisplayInterface[] => {
    const txs: TxDisplayInterface[] = [];
    for (const claimScript in pegins) {
      const pegin = pegins[claimScript];
      const depositUtxos = Object.values(pegin.depositUtxos ?? []);
      for (const utxo of depositUtxos) {
        txs.push({
          type: TxTypeEnum.DepositBtc,
          fee: 0,
          txId: utxo.txid,
          status: utxo.status.confirmed ? TxStatusEnum.Confirmed : TxStatusEnum.Pending,
          transfers: [
            {
              // LBTC hash in order to display btc deposit in LBTC operations
              asset: LBTC_ASSET.assetHash,
              amount: utxo.value ?? 0,
            },
          ],
          blockHeight: utxo.status?.block_height,
          blockTime: utxo.status?.block_time ? moment(utxo.status.block_time * 1000) : undefined,
          claimScript: claimScript,
          claimTxId: utxo.claimTxId,
        });
      }
    }
    return txs;
  }
);

const upsertPeginsInState = (state: BtcState, newPegins: Pegins) => {
  return {
    ...state,
    pegins: merge({ ...newPegins }, state.pegins),
  };
};

export default btcReducer;
