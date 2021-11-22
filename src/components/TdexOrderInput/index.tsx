import { IonRippleEffect, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import type { TradeOrder } from 'tdex-sdk';

import swap from '../../assets/img/swap.svg';
import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import { selectAllTradableAssets } from '../../redux/reducers/tdexReducer';
import type { RootState } from '../../redux/store';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { setAccessoryBar } from '../../utils/keyboard';
import { getTradablesAssets } from '../../utils/tdex';

import { createAmountAndUnit, useTradeState } from './hooks';
import TradeRowInput from './trade-row-input';

import './style.scss';

interface ConnectedProps {
  assetsRegistry: Record<string, AssetConfig>;
  allTradableAssets: AssetConfig[];
  lbtcUnit: LbtcDenomination;
}

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

type Props = ConnectedProps & {
  markets: TDEXMarket[];
  onInput: (tdexOrder?: TdexOrderInputResult) => void;
};

// two rows input component with integrated TDEX discoverer
// let the user chooses a tradable asset pair
// and inputs an amount of satoshis to sell or to buy
// if found, it returns best orders via `onInput` property
const TdexOrderInput: React.FC<Props> = ({ assetsRegistry, allTradableAssets, markets, lbtcUnit, onInput }) => {
  const [
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
  ] = useTradeState(markets);

  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
  });

  useIonViewDidLeave(() => {
    setAccessoryBar(false).catch(console.error);
  });

  useEffect(() => {
    if (sendError || receiveError) onInput(undefined);
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
  }, [bestOrder]);

  const swapSendAndReceiveAsset = () => {
    const receive = receiveAsset;
    setReceiveAsset(sendAsset);
    setSendAsset(receive);
    setSendAmount(sendSats ?? 0);
  };

  return (
    <div className="container">
      <TradeRowInput
        type="send"
        sats={sendSats}
        assetSelected={sendAsset ? assetsRegistry[sendAsset] : undefined}
        isLoading={sendLoader}
        error={sendError}
        onChangeAsset={(asset) => {
          setSendAsset(asset);
          if (sendSats) setSendAmount(sendSats);
        }}
        onChangeSats={setSendAmount}
        searchableAssets={allTradableAssets}
      />
      <div className="exchange-divider ion-activatable" onClick={swapSendAndReceiveAsset}>
        <img src={swap} alt="swap" />
        <IonRippleEffect type="unbounded" />
      </div>
      <TradeRowInput
        type="receive"
        sats={receiveSats}
        assetSelected={receiveAsset ? assetsRegistry[receiveAsset] : undefined}
        isLoading={receiveLoader}
        error={receiveError}
        onChangeAsset={(asset) => {
          setReceiveAsset(asset);
          if (receiveSats) setReceiveAmount(receiveSats);
        }}
        onChangeSats={setReceiveAmount}
        searchableAssets={sendAsset ? getTradablesAssets(markets, sendAsset).map((h) => assetsRegistry[h]) : []}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState): ConnectedProps => ({
  assetsRegistry: state.assets,
  allTradableAssets: selectAllTradableAssets(state),
  lbtcUnit: state.settings.denominationLBTC,
});

export default connect(mapStateToProps)(TdexOrderInput);
