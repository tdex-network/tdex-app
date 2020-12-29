/* eslint-disable no-shadow */
export type ActionType = {
  type: string;
  payload?: any;
};

export enum TxTypeEnum {
  Deposit = 1,
  Withdraw = 2,
  Swap = 3,
  Exchange = 4,
}

export interface TxDisplayInterface {
  asset: string;
  address: string;
  fee: string;
  txId: string;
  amount: number;
  type: TxTypeEnum;
  time: string;
  date: string;
  status: string;
  amountDisplay: string;
  amountDisplayFormatted: string;
  open: boolean;
  sign: string;
}

export enum TxStatusEnum {
  Confirmed = 'confirmed',
  Pending = 'pending',
}

export interface TxsByAssetsInterface {
  [asset: string]: Array<TxDisplayInterface>;
}
