import type moment from 'moment';

export type ActionType<P = any> = {
  type: string;
  payload?: P;
};

export enum TxTypeEnum {
  Receive = 1,
  Send = 2,
  Swap = 3,
  DepositBtc = 4,
  Unknown = 5,
}

export interface TxDisplayInterface {
  type: TxTypeEnum;
  fee: number;
  txId: string;
  status: TxStatusEnum;
  transfers: Transfer[];
  blockHeight?: number;
  blockTime?: moment.Moment;
  // Only used in pegin deposits
  claimScript?: string;
  claimTxId?: string;
}

export interface Transfer {
  asset: string;
  // amount > 0 = received & amount < 0 = sent
  amount: number;
  script: string;
}

export enum TxStatusEnum {
  Confirmed = 'confirmed',
  Pending = 'pending',
}

export interface TxsByAssetsInterface {
  [asset: string]: TxDisplayInterface[];
}
