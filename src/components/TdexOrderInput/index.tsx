import './style.scss';
import { IonRippleEffect, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import type { Dispatch, SetStateAction } from 'react';
import React, { useEffect } from 'react';

import swap from '../../assets/img/swap.svg';
import { getTradablesAssets } from '../../services/tdexService';
import type { TDEXMarket as TDEXMarketV1, TradeOrder as TradeOrderV1 } from '../../services/tdexService/v1/tradeCore';
import type { TDEXMarket as TDEXMarketV2, TradeOrder as TradeOrderV2 } from '../../services/tdexService/v2/tradeCore';
import { useAssetStore } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTdexStore } from '../../store/tdexStore';
import { LBTC_ASSET } from '../../utils/constants';
import { isLbtc } from '../../utils/helpers';
import { setAccessoryBar } from '../../utils/keyboard';
import { createAmountAndUnit } from '../../utils/unitConversion';

import { TradeRowInput } from './TradeRowInput';

export interface SatsAsset {
  sats?: number;
  asset?: string;
}

export interface AmountAndUnit {
  amount: string; // formatted amount of satoshis (depends on precision)
  unit: string; // ticker or lbtcUnit
}

export interface TdexOrderInputResult {
  order: TradeOrderV1 | TradeOrderV2;
  send: SatsAsset & AmountAndUnit;
  receive: SatsAsset & AmountAndUnit;
  providerVersion: 'v1' | 'v2';
}

type Props = {
  markets: { v1: TDEXMarketV1[]; v2: TDEXMarketV2[] };
  onInput: Dispatch<SetStateAction<TdexOrderInputResult | undefined>>;
  bestOrder?: TradeOrderV1 | TradeOrderV2;
  sendAsset?: string;
  sendSats?: number;
  receiveAsset?: string;
  receiveSats?: number;
  setReceiveAsset: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSendAsset: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSendAmount: (amount: number) => Promise<void>;
  setReceiveAmount: (amount: number) => Promise<void>;
  sendLoader: boolean;
  receiveLoader: boolean;
  sendError: Error | undefined;
  receiveError: Error | undefined;
  setFocus: React.Dispatch<React.SetStateAction<'send' | 'receive' | undefined>>;
  swapAssets: () => void;
  setHasBeenSwapped: React.Dispatch<React.SetStateAction<boolean>>;
  setSendAssetHasChanged: React.Dispatch<React.SetStateAction<boolean>>;
  setReceiveAssetHasChanged: React.Dispatch<React.SetStateAction<boolean>>;
};

// two rows input component with integrated TDEX discoverer
// let the user chooses a tradable asset pair
// and inputs an amount of satoshis to sell or to buy
// if found, it returns best orders via `onInput` property
export const TdexOrderInput: React.FC<Props> = ({
  markets,
  onInput,
  bestOrder,
  sendAsset,
  sendSats,
  receiveAsset,
  receiveSats,
  setReceiveAsset,
  setSendAsset,
  setSendAmount,
  setReceiveAmount,
  sendLoader,
  receiveLoader,
  sendError,
  receiveError,
  setFocus,
  swapAssets,
  setHasBeenSwapped,
  setSendAssetHasChanged,
  setReceiveAssetHasChanged,
}) => {
  const assets = useAssetStore((state) => state.assets);
  const network = useSettingsStore((state) => state.network);
  const getProtoVersion = useTdexStore((state) => state.getProtoVersion);
  //
  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
    let sendAsset;
    // Set send asset default to LBTC if available in markets, or first asset in balances
    const lbtcInMarkets =
      markets.v1.find((m) => isLbtc(m.baseAsset, network) || isLbtc(m.quoteAsset, network)) ||
      markets.v2.find((m) => isLbtc(m.baseAsset, network) || isLbtc(m.quoteAsset, network));
    if (lbtcInMarkets !== undefined) {
      sendAsset = LBTC_ASSET[network].assetHash;
      setSendAsset(sendAsset);
    } else {
      for (let asset in assets) {
        const isBalanceAssetInMarkets =
          markets.v1.find((m) => m.baseAsset === asset || m.quoteAsset === asset) ||
          markets.v2.find((m) => m.baseAsset === asset || m.quoteAsset === asset);
        if (isBalanceAssetInMarkets) {
          sendAsset = asset;
          setSendAsset(sendAsset);
          break;
        }
      }
    }
    if (!sendAsset) {
      console.error('No tradable asset found');
      return;
    }
    // Set receive asset to first tradable asset
    const tradableAssets = getTradablesAssets(markets, sendAsset);
    setReceiveAsset(tradableAssets[0]);
  }, [markets, sendAsset]);

  useIonViewDidLeave(() => {
    setAccessoryBar(false).catch(console.error);
    // Clear state when we leave Exchange page
    onInput(undefined);
    setSendAmount(0).catch(console.error);
    setReceiveAmount(0).catch(console.error);
    setReceiveAsset(undefined);
    setSendAsset(undefined);
  }, []);

  useEffect(() => {
    if (sendError || receiveError) onInput(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendError, receiveError]);

  useEffect(() => {
    (async () => {
      const sendValues = {
        sats: sendSats,
        asset: sendAsset,
      };
      const receiveValues = {
        sats: receiveSats,
        asset: receiveAsset,
      };
      if (bestOrder) {
        const version = await getProtoVersion(bestOrder.traderClient.providerUrl);
        onInput({
          order: bestOrder,
          send: { ...sendValues, ...createAmountAndUnit(sendValues) },
          receive: { ...receiveValues, ...createAmountAndUnit(receiveValues) },
          providerVersion: version,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestOrder]);

  return (
    <div className="container">
      <TradeRowInput
        type="send"
        sats={sendSats}
        assetSelected={sendAsset ? assets[sendAsset] : undefined}
        isLoading={sendLoader}
        error={sendError}
        onChangeAsset={(asset: string) => {
          setSendAsset(asset);
          setSendAssetHasChanged(true);
        }}
        onChangeSats={(sats: number) => {
          setHasBeenSwapped(false);
          setSendAmount(sats).catch(console.error);
        }}
        searchableAssets={receiveAsset ? getTradablesAssets(markets, receiveAsset).map((h) => assets[h]) : []}
        onFocus={() => setFocus('send')}
      />
      <div className="exchange-divider ion-activatable" onClick={swapAssets}>
        <img src={swap} alt="swap" />
        <IonRippleEffect type="unbounded" />
      </div>
      <TradeRowInput
        type="receive"
        sats={receiveSats}
        assetSelected={receiveAsset ? assets[receiveAsset] : undefined}
        isLoading={receiveLoader}
        error={receiveError}
        onChangeAsset={(asset: string) => {
          setReceiveAsset(asset);
          setReceiveAssetHasChanged(true);
        }}
        onChangeSats={(sats: number) => {
          setHasBeenSwapped(false);
          setReceiveAmount(sats).catch(console.error);
        }}
        searchableAssets={sendAsset ? getTradablesAssets(markets, sendAsset).map((h) => assets[h]) : []}
        onFocus={() => setFocus('receive')}
      />
    </div>
  );
};
