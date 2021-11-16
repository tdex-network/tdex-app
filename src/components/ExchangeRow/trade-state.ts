import { Discoverer, DiscoveryOpts } from "tdex-sdk";
import { TDEXTrade } from "../../redux/actionTypes/tdexActionTypes";
import { AssetWithTicker } from "../../utils/tdex";
import { ExchangeRowValue } from "./trade-row-input";

export class TradePairState {
  send: ExchangeRowValue;
  receive: ExchangeRowValue;

  private discoverer: Discoverer;

  constructor(
    assetToSend: AssetWithTicker,
    assetToReceive: AssetWithTicker,
    discoverer: Discoverer
  ) {
    this.send = { asset: assetToSend, amount: '0' };
    this.receive = { asset: assetToReceive, amount: '0' };
    this.discoverer = discoverer;
  }

  setSend(toSend: ExchangeRowValue) {
    this.send = toSend;
  }

  setReceive(toReceive: ExchangeRowValue) {
    this.receive = toReceive;
  }

  private update() {
    const trade = this.discoverer.discover({

    })
  }

  private discover(): TDEXTrade {
    const opts: DiscoveryOpts = {
      market: {
        baseAsset: this.send.asset.asset,
        quoteAsset: this.receive.asset.asset,
      },
      amount: this.send.amount,
      type: tr
      price: this.receive.amount,

    }

    const trade = this.discoverer.discover({
      
    })
  }
}

function assetPairToDiscoveryOpts(): 