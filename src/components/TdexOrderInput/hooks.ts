import { useCallback, useEffect, useState } from 'react';
import type { TradeOrder } from 'tdex-sdk';

import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { NoMarketsProvidedError } from '../../utils/errors';
import { fromSatoshiFixed, isLbtcTicker } from '../../utils/helpers';
import { discoverBestOrder, getTradablesAssets, marketPriceRequest } from '../../utils/tdex';

import type { SatsAsset, AmountAndUnit } from '.';

export function createAmountAndUnit(assetsRegistry: Record<string, AssetConfig>, lbtcUnit: LbtcDenomination) {
  return (satsAsset: SatsAsset): AmountAndUnit => {
    if (!satsAsset.asset || !satsAsset.sats)
      return {
        amount: '0',
        unit: 'unknown',
      };
    const assetConfig = assetsRegistry[satsAsset.asset];
    return {
      amount: fromSatoshiFixed(
        satsAsset.sats.toString() || '0',
        assetConfig.precision ?? defaultPrecision,
        assetConfig.precision ?? defaultPrecision,
        isLbtcTicker(assetConfig.ticker) ? lbtcUnit : undefined
      ),
      unit: isLbtcTicker(assetConfig.ticker) ? lbtcUnit : assetConfig.ticker,
    };
  };
}

// calculate price is a wrapper of marketPrice rpc call
// it returns the price of the asset in sats
const calculatePrice =
  (sats: number, asset: string) =>
  async (order: TradeOrder): Promise<SatsAsset> =>
    marketPriceRequest(order, sats, asset);

// custom state hook using to represent an asset/sats pair
function useAssetSats(initialAssetHash?: string) {
  const [assetHash, setAssetHash] = useState<string | undefined>(initialAssetHash);
  const [sats, setSats] = useState<number>();
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
  const [sendLoader, setSendLoader] = useState<boolean>(false);
  const [receiveLoader, setReceiveLoader] = useState<boolean>(false);
  const [focus, setFocus] = useState<'send' | 'receive'>();
  const [sendError, setSendError] = useState<Error>();
  const [receiveError, setReceiveError] = useState<Error>();

  const getTradable = useCallback((asset: string) => getTradablesAssets(markets, asset), [markets]);

  const resetErrors = () => {
    setSendError(undefined);
    setReceiveError(undefined);
  };
  const swapAssets = () => {
    const temp = sendAsset;
    setSendAsset(receiveAsset);
    setReceiveAsset(temp);
    resetErrors();
  };

  const discoverFunction = useCallback(
    () => discoverBestOrder(markets, sendAsset, receiveAsset),
    [markets, receiveAsset, sendAsset]
  );

  const computePriceAndUpdate = useCallback(
    (sats: number, asset: string, type: 'send' | 'receive') => async (order: TradeOrder) => {
      const assetSats = await calculatePrice(sats, asset)(order);
      if (type === 'send') {
        setReceiveSats(assetSats.sats);
      } else {
        setSendSats(assetSats.sats);
      }
      return order;
    },
    [setReceiveSats, setSendSats]
  );

  const updateReceiveSats = useCallback(
    (newSendSats: number) => {
      if (!sendAsset) return;
      setReceiveLoader(true);
      return discoverFunction()(newSendSats ?? 0, sendAsset)
        .then(computePriceAndUpdate(newSendSats ?? 0, sendAsset, 'send')) // set receive sats
        .then(setBestOrder)
        .catch(setReceiveError)
        .finally(() => setReceiveLoader(false));
    },
    [computePriceAndUpdate, discoverFunction, sendAsset]
  );

  const updateSendSats = (newReceiveSats: number) => {
    if (!receiveAsset) return;
    setSendLoader(true);
    return discoverFunction()(newReceiveSats ?? 0, receiveAsset)
      .then(computePriceAndUpdate(newReceiveSats ?? 0, receiveAsset, 'receive')) // set send sats
      .then(setBestOrder)
      .catch(setSendError)
      .finally(() => setSendLoader(false));
  };

  // send sats setter
  // auto-update the received sats amount according to best order
  const setSendAmount = async (sats: number) => {
    setSendError(undefined);
    setSendSats(sats);
    await updateReceiveSats(sats);
  };

  // receive sats setter
  // auto-update sent sats amount according to best order
  const setReceiveAmount = async (sats: number) => {
    setReceiveError(undefined);
    setReceiveSats(sats);
    if (focus === 'receive') await updateSendSats(sats);
  };

  useEffect(() => {
    if (markets.length === 0) {
      setSendError(NoMarketsProvidedError);
      setReceiveError(NoMarketsProvidedError);
    } else {
      resetErrors();
      setSendAmount(sendSats ?? 0).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets.length, sendSats]);

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
  }, [getTradable, receiveAsset, sendAsset, setReceiveAsset]);

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
  }, [getTradable, receiveAsset, sendAsset, setSendAsset]);

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
    setFocus,
    swapAssets,
  ] as const;
}
