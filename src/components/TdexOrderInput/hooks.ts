import { useEffect, useState } from 'react';
import type { TradeOrder } from 'tdex-sdk';

import type { TDEXMarket } from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { NoMarketsAvailableForAllPairsError } from '../../utils/errors';
import { fromSatoshiFixed, isLbtcTicker } from '../../utils/helpers';
import { discoverBestOrder, marketPriceRequest } from '../../utils/tdex';

import type { SatsAsset, AmountAndUnit } from '.';

export function createAmountAndUnit(assetsRegistry: Record<string, AssetConfig>, lbtcUnit: LbtcDenomination) {
  return (satsAsset: SatsAsset): AmountAndUnit => {
    if (!satsAsset.asset || !satsAsset.sats || !assetsRegistry[satsAsset.asset]) {
      return {
        amount: '0',
        unit: 'unknown',
      };
    }
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

// custom state hook using to represent an asset/sats pair
function useAssetSats(initialAssetHash?: string) {
  const [assetHash, setAssetHash] = useState<string | undefined>(initialAssetHash);
  const [sats, setSats] = useState<number>();
  return [assetHash, sats, setAssetHash, setSats] as const;
}

// eslint-disable-next-line
export function useTradeState(markets: TDEXMarket[], balances: BalanceInterface[]) {
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
  const [hasBeenSwapped, setHasBeenSwapped] = useState<boolean>(false);
  const [assetSendBeforeSwap, setAssetSendBeforeSwap] = useState<string | undefined>(sendAsset);
  const [sendAssetHasChanged, setSendAssetHasChanged] = useState<boolean>(false);
  const [receiveAssetHasChanged, setReceiveAssetHasChanged] = useState<boolean>(false);

  const resetErrors = () => {
    setSendError(undefined);
    setReceiveError(undefined);
  };

  const swapAssets = () => {
    if (sendLoader || receiveLoader) return;
    setAssetSendBeforeSwap(sendAsset);
    const temp = sendAsset;
    setSendAsset(receiveAsset);
    setReceiveAsset(temp);
    resetErrors();
  };

  const updateReceiveSats = async (newSendSats: number) => {
    if (receiveAssetHasChanged) {
      setReceiveAssetHasChanged(false);
      return;
    }
    if (receiveLoader || !sendAsset || (focus === 'receive' && !hasBeenSwapped && !sendAssetHasChanged)) return;
    try {
      setReceiveLoader(true);
      const sendBalance = balances.find((b) => b.assetHash === sendAsset)?.amount;
      if (newSendSats > (sendBalance ?? 0)) throw new Error(`send amount greater than balance`);
      const bestOrder = await discoverBestOrder(markets, sendAsset, receiveAsset)(newSendSats ?? 0, sendAsset);
      const assetSats = await marketPriceRequest(bestOrder, newSendSats ?? 0, sendAsset);
      setReceiveSats(assetSats.sats);
      setBestOrder(bestOrder);
      resetErrors();
    } catch (err) {
      console.error(err);
      setSendError(err as any);
    } finally {
      setReceiveLoader(false);
    }
  };

  const updateSendSats = async (newReceiveSats: number) => {
    if (!receiveAsset || (focus === 'send' && !receiveAssetHasChanged) || (focus === 'receive' && hasBeenSwapped)) {
      return;
    }
    try {
      setSendLoader(true);
      const bestOrder = await discoverBestOrder(markets, sendAsset, receiveAsset)(newReceiveSats ?? 0, receiveAsset);
      const assetSats = await marketPriceRequest(bestOrder, newReceiveSats ?? 0, receiveAsset);
      const sendBalance = balances.find((b) => b.assetHash === sendAsset)?.amount;
      if (assetSats.sats > (sendBalance ?? 0)) throw new Error(`not enough balance to receive that amount`);
      setSendSats(assetSats.sats);
      setBestOrder(bestOrder);
      resetErrors();
    } catch (err) {
      console.error(err);
      setReceiveError(err as any);
    } finally {
      setSendLoader(false);
    }
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
    await updateSendSats(sats);
  };

  useEffect(() => {
    if (markets.length === 0) {
      setSendError(NoMarketsAvailableForAllPairsError);
      setReceiveError(NoMarketsAvailableForAllPairsError);
    } else {
      resetErrors();
      setSendAmount(sendSats ?? 0).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets.length, sendSats]);

  // After assets have been actually swapped, setHasBeenSwapped true
  useEffect(() => {
    if (sendAsset !== assetSendBeforeSwap && !sendAssetHasChanged) {
      setHasBeenSwapped(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetSendBeforeSwap, sendAsset]);

  // After hasBeenSwapped has been updated to true, setSendAmount
  useEffect(() => {
    (async () => {
      if (hasBeenSwapped) {
        await setSendAmount(receiveSats ?? 0).catch(console.error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBeenSwapped]);

  useEffect(() => {
    if (sendAssetHasChanged) {
      setSendAmount(sendSats || 0).catch(console.error);
      setSendAssetHasChanged(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendAssetHasChanged]);

  useEffect(() => {
    if (receiveAssetHasChanged) {
      setReceiveAmount(receiveSats || 0).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiveAssetHasChanged]);

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
    setSendLoader,
    sendLoader,
    setReceiveLoader,
    receiveLoader,
    sendError,
    receiveError,
    setFocus,
    swapAssets,
    setHasBeenSwapped,
    setSendAssetHasChanged,
    setReceiveAssetHasChanged,
  ] as const;
}
