
import { useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import React, { useEffect } from 'react';
import { TradeOrder } from 'tdex-sdk';
import { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import { AssetConfig } from '../../utils/constants';
import { setAccessoryBar } from '../../utils/keyboard';
import { useTradeState } from './hooks';

import TradeRowInput from './trade-row-input';

interface ConnectedProps {
  assetRegistry: Record<string, AssetConfig>;
  initialMarket: TDEXMarket;
}

export interface TdexOrderInputResult {
  order: TradeOrder;
  sats: number;
  asset: string;
}

type Props = ConnectedProps & {
  onInput: (tdexOrder: TdexOrderInputResult | undefined) => void;
}

// two rows input component with integrated TDEX discoverer
// let the user chooses a tradable asset pair
// and inputs an amount of satoshis to sell or to buy
// if found, it returns best orders via `onInput` property
const TdexOrderInput: React.FC<Props> = ({
  assetRegistry,
  initialMarket,
  onInput
}) => {
  const [
    bestOrder,
    sendAsset, sendSats,
    receiveAsset, receiveSats,
    setReceiveAsset, setSendAsset,
    setSendAmount, setReceiveAmount,
    sendLoader, receiveLoader,
    sendError, receiveError
  ] = useTradeState(initialMarket.baseAsset, initialMarket.quoteAsset);

  useIonViewDidEnter(() => {
    setAccessoryBar(true).catch(console.error);
  });

  useIonViewDidLeave(() => {
    setAccessoryBar(false).catch(console.error);
  });

  useEffect(() => {
    if (sendError || receiveError) onInput(undefined);
  }, [sendError, receiveError])

  useEffect(() => {
    if (bestOrder) onInput({ order: bestOrder, sats: sendSats, asset: sendAsset });
    onInput(undefined)
  }, [bestOrder])

  return (
    <>
      <TradeRowInput
        type='send'
        sats={sendSats}
        assetSelected={assetRegistry[sendAsset]}
        isLoading={sendLoader}
        error={sendError}
        onChangeAsset={setSendAsset}
        onChangeSats={setSendAmount}
      />
      <TradeRowInput
        type='receive'
        sats={receiveSats}
        assetSelected={assetRegistry[receiveAsset]}
        isLoading={receiveLoader}
        error={receiveError}
        onChangeAsset={setReceiveAsset}
        onChangeSats={setReceiveAmount}
      />
    </>
  );
};

export default TdexOrderInput;
