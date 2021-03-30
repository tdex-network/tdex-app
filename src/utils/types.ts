/* eslint-disable no-shadow */
export type ActionType = {
  type: string;
  payload?: any;
};

export enum TxTypeEnum {
  Deposit = 1,
  Withdraw = 2,
  Swap = 3,
  Unknow = 4,
}

export interface TxDisplayInterface {
  type: TxTypeEnum;
  fee: number;
  txId: string;
  status: TxStatusEnum;
  transfers: Transfer[];
  blockTime?: moment.Moment;
}

export interface Transfer {
  asset: string;
  // amount > 0 = received & amount < 0 = sent
  amount: number;
}

export enum TxStatusEnum {
  Confirmed = 'confirmed',
  Pending = 'pending',
}

export interface TxsByAssetsInterface {
  [asset: string]: Array<TxDisplayInterface>;
}
