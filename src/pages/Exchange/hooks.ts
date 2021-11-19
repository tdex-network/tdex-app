import { useEffect, useState } from 'react';
import { SatsAsset, TdexOrderInputResult } from '../../components/TdexOrderInput';
import { AssetConfig, defaultPrecision, LbtcDenomination } from '../../utils/constants';
import { fromSatoshiFixed } from '../../utils/helpers';

export interface AmountAndUnit {
  amount: string; // formatted amount of satoshis (depends on precision)
  unit: string; // ticker or lbtcDenomination
}

// custom hook using to store TdexOrderInputResult
// set up an effect in order to compute UI values
export function useTdexOrderResultState(lbtcUnit: LbtcDenomination, assetsRegistry: Record<string, AssetConfig>) {
  const [result, setResult] = useState<TdexOrderInputResult>();
  const [send, setSend] = useState<AmountAndUnit>();
  const [receive, setReceive] = useState<AmountAndUnit>();

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

  const resetState = () => {
    setResult(undefined);
    setSend(undefined);
    setReceive(undefined);
  };

  useEffect(() => {
    if (!result) {
      resetState();
      return;
    }

    setResult(result);
    setSend(createAmountAndUnit(result.send));
    setReceive(createAmountAndUnit(result.receive));
  }, [result]);

  return [
    result,
    setResult,
    send,
    receive, // for UI
  ] as const;
}
