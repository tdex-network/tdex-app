import { useEffect, useState } from 'react';
import type { TradeOrder } from 'tdex-sdk';

import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { fromSatoshiFixed } from '../../utils/helpers';
import { discoverBestOrder, getTradablesAssets, marketPriceRequest } from '../../utils/tdex';

import type { SatsAsset, AmountAndUnit } from '.';

export function createAmountAndUnit(assetsRegistry: Record<string, AssetConfig>, lbtcUnit: LbtcDenomination) {
  return (satsAsset: SatsAsset): AmountAndUnit => {
    if (!satsAsset.asset)
      return {
        amount: '0',
        unit: 'unknown',
      };

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
}

interface AssetSats {
  assetHash: string;
  sats: number;
}

// calculate price is a wrapper of marketPrice rpc call
// it returns the price of the asset in sats
const calculatePrice =
  (sats: number, asset: string) =>
  async (order: TradeOrder): Promise<AssetSats> =>
    marketPriceRequest(order, sats, asset);

// custom state hook using to represent an asset/sats pair
function useAssetSats(initialAssetHash?: string) {
  const [assetHash, setAssetHash] = useState<string | undefined>(initialAssetHash);
  const [sats, setSats] = useState<number>(0);

  return [assetHash, sats, setAssetHash, setSats] as const;
}

// eslint-disable-next-line
export function useTradeState(markets: TDEXMarket[]) {
  const [sendAsset, sendSats, setSendAsset, setSendSats] = useAssetSats(
    markets.length > 0 ? markets[0].baseAsset : undefined
  );
  const [receiveAsset, receiveSats, setReceiveAsset, setReceiveSats] = useAssetSats(
    markets.length > 0 ? markets[0].quoteAsset : undefined
  );
  const [bestOrder, setBestOrder] = useState<TradeOrder>();

  const [sendLoader, setSendLoader] = useState(false);
  const [receiveLoader, setReceiveLoader] = useState(false);

  const [needSend, setNeedSend] = useState(false);
  const [needReceive, setNeedReceive] = useState(false);

  const [sendError, setSendError] = useState<Error>();
  const [receiveError, setReceiveError] = useState<Error>();

  const getTradable = (asset: string) => getTradablesAssets(markets, asset);

  const noMarketError = new Error('no market available');

  const resetErrors = () => {
    setSendError(undefined);
    setReceiveError(undefined);
  };

  useEffect(() => {
    if (markets.length <= 0) {
      setSendError(noMarketError);
      setReceiveError(noMarketError);
    } else {
      resetErrors();
      setSendAmount(sendSats);
    }
  }, [markets.length]);

  // auto update receive asset
  useEffect(() => {
    if (!sendAsset) {
      setReceiveAsset(undefined);
      return;
    }

    const tradableAssets = getTradable(sendAsset);
    if (!receiveAsset || !tradableAssets.includes(receiveAsset)) {
      setReceiveAsset(tradableAssets[0]);
    }
  }, [sendAsset]);

  // auto update send asset
  useEffect(() => {
    if (!receiveAsset) {
      setSendAsset(undefined);
      return;
    }

    const tradableAssets = getTradable(receiveAsset);
    if (!sendAsset || !tradableAssets.includes(sendAsset)) {
      setSendAsset(tradableAssets[0]);
    }
  }, [receiveAsset]);

  const discoverFunction = () => discoverBestOrder(markets, sendAsset!, receiveAsset!);

  const computePriceAndUpdate =
    (sats: number, asset: string, type: 'send' | 'receive') => async (order: TradeOrder) => {
      const assetSats = await calculatePrice(sats, asset)(order);
      if (type === 'send') {
        setReceiveSats(assetSats.sats);
      } else {
        setSendSats(assetSats.sats);
      }

      return order;
    };

  const updateReceiveSats = () => {
    if (!needReceive || !sendAsset) return;
    setReceiveLoader(true);
    return discoverFunction()(sendSats, sendAsset)
      .then(computePriceAndUpdate(sendSats, sendAsset, 'send')) // set receive sats
      .then(setBestOrder)
      .catch(setReceiveError)
      .finally(() => setReceiveLoader(false));
  };

  const updateSendSats = () => {
    if (!needSend || !receiveAsset) return;
    setSendLoader(true);
    return discoverFunction()(receiveSats, receiveAsset)
      .then(computePriceAndUpdate(receiveSats, receiveAsset, 'receive')) // set send sats
      .then(setBestOrder)
      .catch(setSendError)
      .finally(() => setSendLoader(false));
  };

  // send sats setter
  // auto-update the receive sats amount according to best order
  const setSendAmount = async (sats: number) => {
    if (!needSend) {
      resetErrors();
    }
    setNeedSend(false);
    setSendSats(sats);
    setNeedReceive(true);
    await updateReceiveSats();
  };

  // receive sats setter
  // auto-update the send sats amount according to best order
  const setReceiveAmount = async (sats: number) => {
    if (!needReceive) {
      resetErrors();
    }
    setNeedReceive(false);
    setReceiveSats(sats);
    setNeedSend(true);
    await updateSendSats();
  };

  return [
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
  ] as const;
}
