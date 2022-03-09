import type { PriceWithFee, BalanceWithFee } from 'tdex-protobuf/generated/js/types_pb';
import type TraderClientInterface from 'tdex-sdk/dist/grpcClientInterface';

interface Args {
  balance?: BalanceWithFee.AsObject;
  price?: PriceWithFee.AsObject;
  providerUrl?: string;
}

export default class MockTraderClientInterface implements TraderClientInterface {
  balance?: BalanceWithFee.AsObject;
  price?: PriceWithFee.AsObject;

  providerUrl: string;
  client: any;

  constructor({ balance, price, providerUrl }: Args) {
    this.balance = balance;
    this.price = price;
    this.providerUrl = providerUrl ?? '';
  }

  tradePropose(_: { baseAsset: string; quoteAsset: string }, __: number, ___: Uint8Array): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  tradeComplete(_: Uint8Array): Promise<string> {
    throw new Error('Method not implemented.');
  }
  proposeTrade(_: { baseAsset: string; quoteAsset: string }, __: number, ___: Uint8Array): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  completeTrade(_: Uint8Array): Promise<string> {
    throw new Error('Method not implemented.');
  }
  markets(): Promise<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }[]> {
    throw new Error('Method not implemented.');
  }
  marketPrice(
    _: { baseAsset: string; quoteAsset: string },
    __: number,
    ___: number,
    ____: string
  ): Promise<PriceWithFee.AsObject[]> {
    if (!this.price) throw new Error('u need to set up a mocked price');
    return Promise.resolve([this.price]);
  }
  balances(_: { baseAsset: string; quoteAsset: string }): Promise<BalanceWithFee.AsObject[]> {
    if (!this.balance) throw new Error('u need to set up a mocked balance');
    return Promise.resolve([this.balance]);
  }
}
