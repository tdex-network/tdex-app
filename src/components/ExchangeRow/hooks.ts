import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TradeOrder } from "tdex-sdk";
import { RootState } from "../../redux/store";
import { allTrades, createDiscoverer, getTradablesAssets } from "../../utils/tdex";

interface AssetSats {
  assetHash: string;
  sats: number;
}

// calculate price is a wrapper of marketPrice rpc call
// it returns the price of the asset in sats
const calculatePrice = (sats: number, asset: string) => async (order: TradeOrder): Promise<AssetSats> => {
   const response = await order.traderClient.marketPrice(
    order.market,
    order.type,
    sats,
    asset
   );
  
  return {
    assetHash: response[0].asset,
    sats: response[0].amount,
  };
}

// custom state hook using to represent an asset/sats pair
function useAssetSats(initialValue: string) {
  const [assetHash, setAssetHash] = useState(initialValue);
  const [sats, setSats] = useState<number>(0);

  return [assetHash, sats, setAssetHash, setSats] as const;
}

export function useTradeState(initialSendAsset: string, initialReceiveAsset: string) {
  const [sendAsset, sendSats, setSendAsset, setSendSats] = useAssetSats(initialSendAsset);
  const [receiveAsset, receiveSats, setReceiveAsset, setReceiveSats] = useAssetSats(initialReceiveAsset);

  const markets = useSelector((s: RootState) => s.tdex.markets);

  const getTradable = (asset: string) => getTradablesAssets(markets, asset).map((r) => r.asset);

  // auto update receive asset
  useEffect(() => {
    const tradableAssets = getTradable(sendAsset);
    if (!tradableAssets.includes(receiveAsset)) {
      setReceiveAsset(tradableAssets[0]);
    }
  }, [sendAsset]);

  // auto update send asset
  useEffect(() => {
    const tradableAssets = getTradable(receiveAsset);
    if (!tradableAssets.includes(sendAsset)) {
      setSendAsset(tradableAssets[0]);
    }
  }, [receiveAsset]);

  const discoverBestProvider = async (sats: number, asset: string): Promise<TradeOrder> => {
    const allPossibleOrders = allTrades(markets, sendAsset, receiveAsset);
    const discoverer = createDiscoverer(allPossibleOrders);

    const orders = await discoverer.discover({ asset, amount: sats });
    return orders[0];
  }

  // auto update receive sats
  useEffect(() => {
    discoverBestProvider(sendSats, sendAsset)
      .then(calculatePrice(sendSats, sendAsset))
      .then((r: AssetSats) => setReceiveSats(r.sats))
      .catch(() => setReceiveSats(0));
    
  }, [sendSats])

  // auto update send sats
  useEffect(() => {
    discoverBestProvider(receiveSats, receiveAsset)
      .then(calculatePrice(receiveSats, receiveAsset))
      .then((r: AssetSats) => setSendSats(r.sats))
      .catch(() => setSendSats(0));
  }, [receiveSats])
}


