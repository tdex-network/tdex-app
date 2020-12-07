export type ActionType = {
  type: string;
  payload?: any;
};

export interface TxDisplayInterface {
  asset: string;
  fee: string;
  txId: string;
  amount: number;
  type: TxType;
  time: string;
  date: string;
  status: string;
  amountDisplay: string;
  amountDisplayFormatted: string;
  open: boolean;
  sign: string;
}

export enum TxType {
  Deposit = 1,
  Withdraw = 2,
  Swap = 3,
  Exchange = 4,
}

export interface TxsByAssetsInterface {
  [asset: string]: Array<TxDisplayInterface>;
}

export enum TxStatus {
  Confirmed = 'confirmed',
  Pending = 'pending',
}
