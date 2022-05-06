import type { BalanceWithFee, Preview } from 'tdex-sdk/dist-web/api-spec/protobuf/gen/js/tdex/v1/types_pb';
import type TraderClientInterface from 'tdex-sdk/dist-web/grpcClientInterface';

interface Args {
  balance: BalanceWithFee;
  preview?: Preview;
  providerUrl?: string;
}

export default class MockTraderClientInterface implements TraderClientInterface {
  balanceWithFee: BalanceWithFee;
  preview?: Preview;

  providerUrl: string;
  client: any;

  constructor({ balance, preview, providerUrl }: Args) {
    this.balanceWithFee = balance;
    this.preview = preview;
    this.providerUrl = providerUrl ?? '';
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
  marketPrice(_: { baseAsset: string; quoteAsset: string }, __: number, ___: number, ____: string): Promise<Preview[]> {
    if (!this.preview) throw new Error('u need to set up a mocked preview');
    return Promise.resolve([this.preview]);
  }
  balance(_: { baseAsset: string; quoteAsset: string }): Promise<BalanceWithFee> {
    if (!this.balance) throw new Error('u need to set up a mocked balance');
    return Promise.resolve(this.balanceWithFee);
  }
}
