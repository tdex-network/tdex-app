import moment from 'moment';
import { createSelector } from 'reselect';

import { LBTC_ASSET } from '../../utils/constants';
import type { ActionType, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';
import {
  SET_CURRENT_BTC_BLOCK_HEIGHT,
  SET_UTXO_BTC,
  UPSERT_PEGINS,
} from '../actions/btcActions';

import { outpointToString } from './walletReducer';

// Deposit pegin utxos
export interface DepositPeginUtxo {
  txid: string;
  vout: number;
  status: {
    confirmed: TxStatusEnum;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}
export type DepositPeginUtxos = Record<string, DepositPeginUtxo>;
// Pegin
export interface Pegin {
  depositAddress: {
    address: string;
    claimScript: string;
    derivationPath: string;
  };
  // Infos added after successful claim
  claimTxId?: string;
  depositAmount?: number;
  depositBlockHeight?: number;
  depositTxId?: string;
  depositVout?: number;
}
export type ClaimScript = string;
export type Pegins = Record<ClaimScript, Pegin>;

export interface BtcState {
  currentBlockHeight: number;
  depositPeginUtxos: DepositPeginUtxos;
  pegins: Pegins;
}

export const initialState: BtcState = {
  currentBlockHeight: 0,
  depositPeginUtxos: {},
  pegins: {},
};

function btcReducer(state = initialState, action: ActionType): BtcState {
  switch (action.type) {
    case SET_UTXO_BTC:
      return addUtxoBtcInState(state, action.payload);
    case SET_CURRENT_BTC_BLOCK_HEIGHT: {
      return {
        ...state,
        currentBlockHeight: action.payload,
      };
    }
    case UPSERT_PEGINS: {
      return upsertPeginsInState(state, action.payload.pegins);
    }
    default:
      return state;
  }
}

const addUtxoBtcInState = (state: BtcState, utxo: DepositPeginUtxo) => {
  const newUtxosBtcMap = { ...state.depositPeginUtxos };
  newUtxosBtcMap[outpointToString(utxo)] = utxo;
  return { ...state, depositPeginUtxos: newUtxosBtcMap };
};

export const depositPeginUtxosToDisplayTxSelector = createSelector(
  ({ btc }: { btc: BtcState }) => btc.depositPeginUtxos,
  (depositPeginUtxos): TxDisplayInterface[] => {
    return Object.values(depositPeginUtxos).map(({ txid, value, status }) => {
      return {
        type: TxTypeEnum.DepositBtc,
        fee: 0,
        txId: txid,
        status: TxStatusEnum.Confirmed,
        transfers: [
          {
            // In order to display btc deposit in LBTC operations
            asset: LBTC_ASSET.assetHash,
            amount: value ?? 0,
          },
        ],
        blockHeight: status.block_height,
        blockTime: status.block_time
          ? moment(status.block_time * 1000)
          : undefined,
      };
    });
  },
);

const upsertPeginsInState = (state: BtcState, pegins: Pegins) => {
  let updatedPegins: Pegins = state.pegins;
  (Object.entries(pegins) as [string, Pegin][]).forEach(
    ([claimScript, pegin]) => {
      updatedPegins = {
        ...updatedPegins,
        [claimScript]: pegin,
      };
    },
  );
  return {
    ...state,
    pegins: updatedPegins,
  };
};

export default btcReducer;
