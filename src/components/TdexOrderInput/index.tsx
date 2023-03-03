import './style.scss';
import { IonRippleEffect, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import React, { useEffect } from 'react';

import swap from '../../assets/img/swap.svg';
import { getTradablesAssets } from '../../services/tdexService';
import type { TDEXMarket, TradeOrder as TradeOrderV1 } from '../../services/tdexService/v1/tradeCore';
import type { TradeOrder as TradeOrderV2 } from '../../services/tdexService/v2/tradeCore';
import { useAssetStore } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import { LBTC_ASSET } from '../../utils/constants';
import { isLbtc } from '../../utils/helpers';
import { setAccessoryBar } from '../../utils/keyboard';

import { TradeRowInput } from './TradeRowInput';
import { createAmountAndUnit } from './hooks';

export interface SatsAsset {
  sats?: number;
  asset?: string;
}

export interface AmountAndUnit {
  amount: string; // formatted amount of satoshis (depends on precision)
  unit: string; // ticker or lbtcUnit
}

export interface TdexOrderInputResultV1 {
  order: TradeOrderV1;
  send: SatsAsset & AmountAndUnit;
  receive: SatsAsset & AmountAndUnit;
}

export interface TdexOrderInputResultV2 {
  order: TradeOrderV2;
  send: SatsAsset & AmountAndUnit;
  receive: SatsAsset & AmountAndUnit;
}

type Props = {
  markets: TDEXMarket[];
  onInput: (tdexOrder?: TdexOrderInputResultV1 | TdexOrderInputResultV2) => void;
  bestOrder?: any /*TradeOrder*/;
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
  const lbtcUnit = useSettingsStore((state) => state.lbtcUnit);
  const network = useSettingsStore((state) => state.network);
  //
  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
    // Set send asset default to LBTC if available in markets, or first asset in balances
    const lbtcInMarkets = markets.find((m) => isLbtc(m.baseAsset, network) || isLbtc(m.quoteAsset, network));
    const sendAsset = lbtcInMarkets !== undefined ? LBTC_ASSET[network].assetHash : assets[0]?.assetHash;
    setSendAsset(sendAsset);
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

  const createAmountAndUnitFn = createAmountAndUnit(assets, lbtcUnit);

  useEffect(() => {
    const sendValues = {
      sats: sendSats,
      asset: sendAsset,
    };
    const receiveValues = {
      sats: receiveSats,
      asset: receiveAsset,
    };
    if (bestOrder)
      onInput({
        order: bestOrder,
        send: { ...sendValues, ...createAmountAndUnitFn(sendValues) },
        receive: { ...receiveValues, ...createAmountAndUnitFn(receiveValues) },
      });
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
