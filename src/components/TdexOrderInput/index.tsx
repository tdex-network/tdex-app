import { IonRippleEffect, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import type { TradeOrder } from 'tdex-sdk';

import swap from '../../assets/img/swap.svg';
import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import { selectAllTradableAssets } from '../../redux/reducers/tdexReducer';
import type { RootState } from '../../redux/store';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { fromSatoshiFixed } from '../../utils/helpers';
import { setAccessoryBar } from '../../utils/keyboard';
import { getTradablesAssets } from '../../utils/tdex';

import { useTradeState } from './hooks';
import TradeRowInput from './trade-row-input';

import './style.scss';

interface ConnectedProps {
  assetsRegistry: Record<string, AssetConfig>;
  initialMarket: TDEXMarket;
  allTradableAssets: AssetConfig[];
  markets: TDEXMarket[];
  lbtcUnit: LbtcDenomination;
}

export interface SatsAsset {
  sats: number;
  asset: string;
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
  onInput: (tdexOrder?: TdexOrderInputResult) => void;
};

// two rows input component with integrated TDEX discoverer
// let the user chooses a tradable asset pair
// and inputs an amount of satoshis to sell or to buy
// if found, it returns best orders via `onInput` property
const TdexOrderInput: React.FC<Props> = ({
  assetsRegistry,
  initialMarket,
  allTradableAssets,
  markets,
  lbtcUnit,
  onInput,
}) => {
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
  ] = useTradeState(initialMarket.baseAsset, initialMarket.quoteAsset);

  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
  });

  useIonViewDidLeave(() => {
    setAccessoryBar(false).catch(console.error);
  });

  useEffect(() => {
    if (sendError || receiveError) onInput(undefined);
  }, [sendError, receiveError]);

  const createAmountAndUnit = (satsAsset: SatsAsset): AmountAndUnit => {
    const assetConfig = assetsRegistry[satsAsset.asset];
    return {
      amount: fromSatoshiFixed(
        satsAsset.sats.toString() || '0',
        assetConfig.precision,
        assetConfig.precision ?? defaultPrecision,
        assetConfig.ticker === 'L-BTC' ? lbtcUnit : undefined
      ),
      unit: assetConfig.ticker === 'L-BTC' ? lbtcUnit : assetConfig.ticker,
    };
  };

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
        send: { ...sendValues, ...createAmountAndUnit(sendValues) },
        receive: { ...receiveValues, ...createAmountAndUnit(receiveValues) },
      });
  }, [bestOrder]);

  const swapSendAndReceiveAsset = () => {
    const receive = receiveAsset;
    setReceiveAsset(sendAsset);
    setSendAsset(receive);
  };

  return (
    <div className="container">
      <TradeRowInput
        type="send"
        sats={sendSats}
        assetSelected={assetsRegistry[sendAsset]}
        isLoading={sendLoader}
        error={sendError}
        onChangeAsset={setSendAsset}
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
        assetSelected={assetsRegistry[receiveAsset]}
        isLoading={receiveLoader}
        error={receiveError}
        onChangeAsset={setReceiveAsset}
        onChangeSats={setReceiveAmount}
        searchableAssets={getTradablesAssets(markets, sendAsset).map((h) => assetsRegistry[h])}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState): ConnectedProps => ({
  assetsRegistry: state.assets,
  initialMarket: state.tdex.markets[0],
  markets: state.tdex.markets,
  allTradableAssets: selectAllTradableAssets(state),
  lbtcUnit: state.settings.denominationLBTC,
});

export default connect(mapStateToProps)(TdexOrderInput);
