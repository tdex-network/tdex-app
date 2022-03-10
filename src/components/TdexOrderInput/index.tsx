import './style.scss';
import { IonRippleEffect, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import type { NetworkString, TradeOrder } from 'tdex-sdk';

import swap from '../../assets/img/swap.svg';
import TradeRowInput from '../../components/TdexOrderInput/TradeRowInput';
import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { balancesSelector } from '../../redux/reducers/walletReducer';
import type { RootState } from '../../redux/types';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { LBTC_ASSET } from '../../utils/constants';
import { isLbtc } from '../../utils/helpers';
import { setAccessoryBar } from '../../utils/keyboard';
import { getTradablesAssets } from '../../utils/tdex';

import { createAmountAndUnit } from './hooks';

export interface SatsAsset {
  sats?: number;
  asset?: string;
}

export interface AmountAndUnit {
  amount: string; // formatted amount of satoshis (depends on precision)
  unit: string; // ticker or lbtcDenomination
}

export interface TdexOrderInputResult {
  order: TradeOrder;
  send: SatsAsset & AmountAndUnit;
  receive: SatsAsset & AmountAndUnit;
}

interface ConnectedProps {
  assetsRegistry: Record<string, AssetConfig>;
  balances: BalanceInterface[];
  lbtcUnit: LbtcDenomination;
  network: NetworkString;
}

type Props = ConnectedProps & {
  markets: TDEXMarket[];
  onInput: (tdexOrder?: TdexOrderInputResult) => void;
  bestOrder?: TradeOrder;
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
const TdexOrderInput: React.FC<Props> = ({
  assetsRegistry,
  balances,
  markets,
  lbtcUnit,
  network,
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
  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
    // Set send asset default to LBTC if available in markets, or first asset in balances
    const lbtcInMarkets = markets.find((m) => isLbtc(m.baseAsset, network) || isLbtc(m.quoteAsset, network));
    const sendAsset = lbtcInMarkets !== undefined ? LBTC_ASSET[network].assetHash : balances[0]?.assetHash;
    setSendAsset(sendAsset);
    // Set receive asset to first tradable asset
    const tradableAssets = getTradablesAssets(markets, sendAsset);
    setReceiveAsset(tradableAssets[0]);
  });

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

  const createAmountAndUnitFn = createAmountAndUnit(assetsRegistry, lbtcUnit);

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
        assetSelected={sendAsset ? assetsRegistry[sendAsset] : undefined}
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
        searchableAssets={receiveAsset ? getTradablesAssets(markets, receiveAsset).map((h) => assetsRegistry[h]) : []}
        onFocus={() => setFocus('send')}
      />
      <div className="exchange-divider ion-activatable" onClick={swapAssets}>
        <img src={swap} alt="swap" />
        <IonRippleEffect type="unbounded" />
      </div>
      <TradeRowInput
        type="receive"
        sats={receiveSats}
        assetSelected={receiveAsset ? assetsRegistry[receiveAsset] : undefined}
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
        searchableAssets={sendAsset ? getTradablesAssets(markets, sendAsset).map((h) => assetsRegistry[h]) : []}
        onFocus={() => setFocus('receive')}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    assetsRegistry: state.assets,
    balances: balancesSelector(state).filter(
      (b) => b.amount > 0 && getTradablesAssets(state.tdex.markets, b.assetHash).length > 0
    ),
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
  };
};

export default connect(mapStateToProps)(TdexOrderInput);
