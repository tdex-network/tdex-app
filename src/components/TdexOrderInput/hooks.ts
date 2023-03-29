import { useEffect, useState } from 'react';

import {
  discoverBestOrder,
  isTradeOrderV2,
  marketPriceRequestV1,
  marketPriceRequestV2,
} from '../../services/tdexService';
import type { TDEXMarket as TDEXMarketV1, TradeOrder as TradeOrderV1 } from '../../services/tdexService/v1/tradeCore';
import type { TDEXMarket as TDEXMarketV2, TradeOrder as TradeOrderV2 } from '../../services/tdexService/v2/tradeCore';
import type { Asset } from '../../store/assetStore';
import { useWalletStore } from '../../store/walletStore';
import type { LbtcUnit } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { NoMarketsAvailableForAllPairsError } from '../../utils/errors';
import { isLbtcTicker } from '../../utils/helpers';
import { fromSatoshiFixed } from '../../utils/unitConversion';

import type { SatsAsset, AmountAndUnit } from '.';

export function createAmountAndUnit(assetRegistry: Record<string, Asset>, lbtcUnit: LbtcUnit) {
  return (satsAsset: SatsAsset): AmountAndUnit => {
    if (!satsAsset.asset || !satsAsset.sats || !assetRegistry[satsAsset.asset]) {
      return {
        amount: '0',
        unit: 'unknown',
      };
    }
    const asset = assetRegistry[satsAsset.asset];
    return {
      amount: fromSatoshiFixed(
        satsAsset.sats ?? 0,
        asset.precision ?? defaultPrecision,
        asset.precision ?? defaultPrecision,
        isLbtcTicker(asset.ticker) ? lbtcUnit : undefined
      ),
      unit: isLbtcTicker(asset.ticker) ? lbtcUnit : asset.ticker,
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
export function useTradeState(markets: { v1: TDEXMarketV1[]; v2: TDEXMarketV2[] }) {
  const balances = useWalletStore((s) => s.balances);
  const [sendAsset, sendSats, setSendAsset, setSendSats] = useAssetSats(
    markets.v1.length > 0 ? markets.v1[0].baseAsset : markets.v2.length > 0 ? markets.v2[0].baseAsset : undefined
  );
  const [receiveAsset, receiveSats, setReceiveAsset, setReceiveSats] = useAssetSats(
    markets.v1.length > 0 ? markets.v1[0].quoteAsset : markets.v2.length > 0 ? markets.v2[0].quoteAsset : undefined
  );
  const [bestOrder, setBestOrder] = useState<TradeOrderV1 | TradeOrderV2>();
  const [sendLoader, setSendLoader] = useState<boolean>(false);
  const [receiveLoader, setReceiveLoader] = useState<boolean>(false);
  const [focus, setFocus] = useState<'send' | 'receive'>();
  const [sendError, setSendError] = useState<Error>();
  const [receiveError, setReceiveError] = useState<Error>();
  const [hasBeenSwapped, setHasBeenSwapped] = useState<boolean>(false);
  const [assetSendBeforeSwap, setAssetSendBeforeSwap] = useState<string | undefined>(sendAsset);
  const [sendAssetHasChanged, setSendAssetHasChanged] = useState<boolean>(false);
  const [receiveAssetHasChanged, setReceiveAssetHasChanged] = useState<boolean>(false);
  const sendBalance = balances?.[sendAsset ?? ''];

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
      if (newSendSats > (sendBalance?.sats ?? 0)) throw new Error(`not enough balance`);
      let assetSats;
      const bestOrder = await discoverBestOrder(
        markets,
        sendAsset,
        receiveAsset
      )(newSendSats ?? 0, sendAsset as string);
      if (isTradeOrderV2(bestOrder)) {
        assetSats = await marketPriceRequestV2(bestOrder, newSendSats ?? 0, sendAsset as string);
      } else {
        assetSats = await marketPriceRequestV1(bestOrder, newSendSats ?? 0, sendAsset as string);
      }
      setBestOrder(bestOrder);
      setReceiveSats(Number(assetSats.sats));
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
      let bestOrder, assetSats;
      bestOrder = await discoverBestOrder(
        markets,
        sendAsset,
        receiveAsset
      )(newReceiveSats ?? 0, receiveAsset as string);
      if (isTradeOrderV2(bestOrder)) {
        assetSats = await marketPriceRequestV2(bestOrder, newReceiveSats ?? 0, receiveAsset as string);
      } else {
        assetSats = await marketPriceRequestV1(bestOrder, newReceiveSats ?? 0, receiveAsset as string);
      }
      if (Number(assetSats.sats) > (sendBalance?.sats ?? 0)) throw new Error(`not enough balance`);
      setBestOrder(bestOrder);
      setSendSats(Number(assetSats.sats));
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
    if (markets.v1.length === 0 && markets.v2.length === 0) {
      setSendError(NoMarketsAvailableForAllPairsError);
      setReceiveError(NoMarketsAvailableForAllPairsError);
    } else {
      resetErrors();
      setSendAmount(sendSats ?? 0).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets.v1.length, markets.v2.length, sendSats]);

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
