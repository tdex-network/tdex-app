import moment from 'moment';
import { createSelector } from 'reselect';

import { LBTC_ASSET } from '../../utils/constants';
import type { ActionType, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';
import {
  SET_CURRENT_BTC_BLOCK_HEIGHT,
  SET_UTXO_BTC,
} from '../actions/btcActions';

import { outpointToString } from './walletReducer';

export interface UtxoBtc {
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

export interface BtcState {
  currentBlockHeight: number;
  utxosBtc: Record<string, UtxoBtc>;
}

export const initialState: BtcState = {
  currentBlockHeight: 0,
  utxosBtc: {},
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
    default:
      return state;
  }
}

const addUtxoBtcInState = (state: BtcState, utxo: UtxoBtc) => {
  const newUtxosBtcMap = { ...state.utxosBtc };
  newUtxosBtcMap[outpointToString(utxo)] = utxo;
  return { ...state, utxosBtc: newUtxosBtcMap };
};

export const utxosBtcToDisplayTxSelector = createSelector(
  ({ btc }: { btc: BtcState }) => btc.utxosBtc,
  (utxosBtc): TxDisplayInterface[] => {
    return Object.values(utxosBtc).map(({ txid, value, status }) => {
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

export default btcReducer;
