import { networks } from 'liquidjs-lib';

import { SwapAccept as SwapAcceptV1 } from '../../api-spec/protobuf/gen/js/tdex/v1/swap_pb';
import { SwapAccept as SwapAcceptV2 } from '../../api-spec/protobuf/gen/js/tdex/v2/swap_pb';
import { TradeType } from '../../api-spec/protobuf/gen/js/tdex/v2/types_pb';
import { useWalletStore } from '../../store/walletStore';
import type { NetworkString } from '../../utils/constants';
import { decodePset, isRawTransaction, isValidAmount } from '../../utils/transaction';
import { BlinderService } from '../blinderService';
import type { SignerInterface } from '../signerService';

import type TraderClientInterface from './clientInterface';
import Core from './core';
import type { CoreInterface } from './core';
import { Swap } from './swap';
import type { UnblindedOutput } from './transaction';
import { SwapTransaction } from './transaction';

export interface TDEXProvider {
  name: string;
  endpoint: string;
}

export interface MarketInterface {
  baseAsset: string;
  quoteAsset: string;
}

export interface TDEXMarket {
  baseAsset: string;
  quoteAsset: string;
  provider: TDEXProvider;
  baseAmount?: string;
  quoteAmount?: string;
  feeBasisPoint?: number;
}

export interface TradeOrder {
  type: TradeType;
  market: TDEXMarket;
  traderClient: TraderClientInterface;
}

export interface TradeInterface extends CoreInterface {
  utxos: UnblindedOutput[];
}

export interface TradeOpts {
  providerUrl: string;
  explorerUrl: string;
  utxos: UnblindedOutput[];
  protoVersion: 'v1' | 'v2';
  chain: NetworkString;
  masterBlindingKey: string;
  signer: SignerInterface;
}

export interface BuySellOpts {
  market: MarketInterface;
  amount: number;
  asset: string;
}

export type TraderClientInterfaceFactory = (providerUrl: string) => TraderClientInterface;

export class TradeCore extends Core implements TradeInterface {
  client: TraderClientInterface;
  utxos: UnblindedOutput[];
  masterBlindingKey: string;
  signer: SignerInterface;

  constructor(args: TradeOpts, factoryTraderClient: TraderClientInterfaceFactory) {
    super(args);

    this.validate(args);
    this.utxos = args.utxos;
    this.client = factoryTraderClient(args.providerUrl);
    this.masterBlindingKey = args.masterBlindingKey;
    this.signer = args.signer;
  }

  validate(args: TradeOpts): void {
    if (!this.protoVersion)
      throw new Error('To be able to trade you need to select a protoVersion via { protoVersion }');

    if (!this.providerUrl)
      throw new Error('To be able to trade you need to select a liquidity provider via { providerUrl }');

    if (!this.explorerUrl) throw new Error('To be able to trade you need to select an explorer via { explorerUrl }');

    if (args.utxos.length <= 0) {
      throw new Error('You need at least one utxo to trade');
    }
  }

  /**
   * Trade.buy let the trader buy the baseAsset,
   * sending his own quoteAsset using the current market price
   */
  async buy({ market, amount, asset }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(market, TradeType.BUY, amount, asset);

    // Retry in case we are too early and the provider doesn't find any trade
    // matching the swapAccept id
    while (true) {
      try {
        return await this.marketOrderComplete(swapAccept);
      } catch (e) {
        const err = e as Error;
        if (err.message && err.message.includes('not found')) {
          continue;
        }
        throw e;
      }
    }
  }

  /**
   * Trade.buyWihtoutComplete let the trader buy the baseAsset,
   * sending his own quoteAsset using the current market price wihtout
   * broadcasting the tx
   */
  async buyWithoutComplete({ market, amount, asset }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(market, TradeType.BUY, amount, asset);
    const autoComplete = true;
    return await this.marketOrderComplete(swapAccept, autoComplete);
  }

  /**
   * Trade.sell let the trader sell the baseAsset,
   * receiving the quoteAsset using the current market price
   */
  async sell({ market, amount, asset }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(market, TradeType.SELL, amount, asset);

    // Retry in case we are too early and the provider doesn't find any trade
    // matching the swapAccept id
    while (true) {
      try {
        return await this.marketOrderComplete(swapAccept);
      } catch (e) {
        const err = e as Error;
        if (err.message && err.message.includes('not found')) {
          continue;
        }
        throw e;
      }
    }
  }

  /**
   * Trade.sellWithoutComplete let the trader sell the baseAsset,
   * receiving the quoteAsset using the current market price without
   * broadcasting the tx
   */
  async sellWithoutComplete({ market, amount, asset }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(market, TradeType.SELL, amount, asset);
    const autoComplete = true;
    return await this.marketOrderComplete(swapAccept, autoComplete);
  }

  async preview({
    market,
    tradeType,
    amount,
    asset,
  }: {
    market: MarketInterface;
    tradeType: TradeType;
    amount: number;
    asset: string;
  }): Promise<{
    assetToBeSent: string;
    amountToBeSent: number;
    assetToReceive: string;
    amountToReceive: number;
  }> {
    if (!isValidAmount(amount)) {
      throw new Error('Amount is not valid');
    }
    const { baseAsset, quoteAsset } = market;

    const prices = await this.client.marketPrice(
      {
        baseAsset,
        quoteAsset,
      },
      tradeType,
      amount,
      asset
    );

    const previewedAmount = prices[0].amount;
    if (tradeType === TradeType.BUY) {
      return {
        assetToBeSent: quoteAsset,
        amountToBeSent: asset === baseAsset ? Number(previewedAmount) : Number(amount),
        assetToReceive: baseAsset,
        amountToReceive: asset === baseAsset ? Number(amount) : Number(previewedAmount),
      };
    }

    return {
      assetToBeSent: baseAsset,
      amountToBeSent: asset === quoteAsset ? Number(previewedAmount) : Number(amount),
      assetToReceive: quoteAsset,
      amountToReceive: asset === quoteAsset ? Number(amount) : Number(previewedAmount),
    };
  }

  private async marketOrderRequest(
    market: MarketInterface,
    tradeType: TradeType,
    amountInSatoshis: number,
    assetHash: string
  ): Promise<Uint8Array> {
    const { assetToBeSent, amountToBeSent, assetToReceive, amountToReceive } = await this.preview({
      market,
      tradeType,
      amount: amountInSatoshis,
      asset: assetHash,
    });

    const addressForOutput = await useWalletStore.getState().getNextAddress(false);
    if (!addressForOutput.confidentialAddress) throw new Error('No address available for output');
    const addressForChange = await useWalletStore.getState().getNextAddress(true);
    if (!addressForChange.confidentialAddress) throw new Error('No address available for output');

    const swapTx = new SwapTransaction({
      network: networks[this.chain],
      masterBlindingKey: this.masterBlindingKey,
    });
    await swapTx.create(
      this.utxos,
      amountToBeSent,
      amountToReceive,
      assetToBeSent,
      assetToReceive,
      addressForOutput.confidentialAddress,
      addressForChange.confidentialAddress
    );
    const swap = new Swap();
    const swapRequestSerialized = await swap.request({
      assetToBeSent,
      amountToBeSent,
      assetToReceive,
      amountToReceive,
      psetBase64: swapTx.pset.toBase64(),
      inputBlindingKeys: swapTx.inputBlindingKeys,
      outputBlindingKeys: swapTx.outputBlindingKeys,
    });

    // 0 === Buy === receiving base_asset; 1 === sell === receiving base_asset
    let swapAcceptSerialized: Uint8Array;
    try {
      swapAcceptSerialized = await this.client.proposeTrade(market, tradeType, swapRequestSerialized);
    } catch (e) {
      throw e;
    }

    return swapAcceptSerialized;
  }

  private async marketOrderComplete(swapAcceptSerialized: Uint8Array, autoComplete?: boolean): Promise<string> {
    // trader need to check the signed inputs by the provider
    // and add his own inputs if all is correct
    let swapAcceptMessage;
    if (this.protoVersion === 'v1') {
      swapAcceptMessage = SwapAcceptV1.fromBinary(swapAcceptSerialized);
    } else {
      swapAcceptMessage = SwapAcceptV2.fromBinary(swapAcceptSerialized);
    }
    const psetBase64 = swapAcceptMessage.transaction;
    const blinder = new BlinderService();
    const blindedPset = await blinder.blindPset(decodePset(psetBase64));
    const signedPset = await this.signer.signPset(blindedPset);
    const signedHex = this.signer.finalizeAndExtract(signedPset);

    if (autoComplete) {
      if (isRawTransaction(signedHex)) {
        return signedHex;
      }
    }

    // Trader  adds his signed inputs to the transaction
    const swap = new Swap();
    const swapCompleteSerialized = swap.complete({
      message: swapAcceptSerialized,
      psetBase64OrHex: signedHex,
    });
    // Trader call the completeTrade endpoint to finalize the swap
    let txid: string;
    try {
      txid = await this.client.completeTrade(swapCompleteSerialized);
    } catch (e) {
      throw e;
    }
    return txid;
  }
}
