import {
  ChangeAddressFromAssetGetter,
  CoinSelectionResult,
  CoinSelector,
  estimateTxSize,
  fetchTxHex,
  greedyCoinSelector,
  isBlindedUtxo,
  RecipientInterface,
  UtxoInterface,
} from 'ldk';
import { BalanceInterface } from '../redux/actionTypes/walletActionTypes';
import {
  AssetConfig,
  defaultPrecision,
  getColor,
  getMainAsset,
} from './constants';
import { lockUtxo } from '../redux/actions/walletActions';
import { Dispatch } from 'redux';
import { network } from '../redux/config';

export const createColorFromHash = (id: string): string => {
  let hash = 0;
  if (id.length === 0) throw Error('id length must be > 0');
  const color = getColor(id);
  if (color) return color;
  const ticker = tickerFromAssetHash(id);
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
};

export function toSatoshi(x: number, y?: number): number {
  return Math.floor(x * Math.pow(10, y || defaultPrecision));
}

export function fromSatoshi(x: number, y?: number): number {
  return x / Math.pow(10, y || defaultPrecision);
}

export function fromSatoshiFixed(
  x: number,
  y?: number,
  fixed?: number
): string {
  return Number(fromSatoshi(x, y).toFixed(fixed || 2)).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: fixed || 2 }
  );
}

export function formatAmount(amount: number) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

export function formatDate(date: any) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPriceString(price: string | number): string {
  const decimals = (Number(price) % 1).toFixed(2);
  const intReverseArr = Math.trunc(Number(price))
    .toString()
    .split('')
    .reverse();
  return (
    intReverseArr.reduce((res: string, ch: string, i: number): string => {
      const isEvenThree = Number(i + 1) % 3;
      return isEvenThree === 0 && i < intReverseArr.length - 1
        ? `.${ch}${res}`
        : `${ch}${res}`;
    }, '') + `,${decimals.replace('0.', '')}`
  );
}

export function groupBy(xs: Array<any>, key: string) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Use esplora server to fetchTxHex
 * @param txid
 * @param explorerURL
 */
export async function waitForTx(txid: string, explorerURL: string) {
  let go = true;
  while (go) {
    try {
      await fetchTxHex(txid, explorerURL);
      go = false;
    } catch (_) {
      await sleep(800);
      continue;
    }
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// compute balances value from a set of utxos
export function balancesFromUtxos(
  utxos: UtxoInterface[],
  assets: Record<string, AssetConfig>
): BalanceInterface[] {
  const balances: BalanceInterface[] = [];
  const utxosGroupedByAsset: Record<string, UtxoInterface[]> = groupBy(
    utxos,
    'asset'
  );

  for (const asset of Object.keys(utxosGroupedByAsset)) {
    const utxosForAsset = utxosGroupedByAsset[asset];
    const amount = sumUtxos(utxosForAsset);

    const coinGeckoID = getMainAsset(asset)?.coinGeckoID;
    balances.push({
      asset,
      amount,
      ticker: assets[asset]?.ticker || tickerFromAssetHash(asset),
      coinGeckoID,
      precision: assets[asset]?.precision || defaultPrecision,
    });
  }

  return balances;
}

function sumUtxos(utxos: UtxoInterface[]): number {
  let sum = 0;
  for (const utxo of utxos) {
    if (!isBlindedUtxo(utxo) && utxo.value) {
      sum += utxo.value;
    }
  }
  return sum;
}

export function tickerFromAssetHash(assetHash?: string): string {
  if (!assetHash) return '';
  const mainAsset = getMainAsset(assetHash);
  if (mainAsset) return mainAsset.ticker;
  return assetHash.slice(0, 4).toUpperCase();
}

/**
 * Returns a custom coinSelector
 * @param dispatch if defined, will lock the selected utxos.
 */
export function customCoinSelector(dispatch?: Dispatch): CoinSelector {
  const greedy = greedyCoinSelector();
  if (!dispatch) return greedy;
  return (
    unspents: UtxoInterface[],
    outputs: RecipientInterface[],
    changeGetter: ChangeAddressFromAssetGetter
  ): CoinSelectionResult => {
    const result = greedy(unspents, outputs, changeGetter);
    for (const utxo of result.selectedUtxos) {
      dispatch(lockUtxo(utxo.txid, utxo.vout));
    }
    return result;
  };
}

function getAssetHashLBTC() {
  if (network.chain === 'regtest')
    return '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225';
  return '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d';
}

/**
 * Estimate the number of LBTC sats to pay fees
 * @param setOfUtxos spendable unspents coins
 * @param recipients a set of recipients/outputs describing the transaction
 */
export function estimateFeeAmount(
  setOfUtxos: UtxoInterface[],
  recipients: RecipientInterface[],
  satsPerByte = 0.1
): number {
  const address = 'doesntmatteraddress';
  console.log(recipients[0].value);
  const { selectedUtxos, changeOutputs } = customCoinSelector()(
    setOfUtxos,
    [
      ...recipients,
      // {
      //   address,
      //   asset: getAssetHashLBTC(),
      //   value: 100,
      // },
    ],
    () => address
  );
  return Math.ceil(
    estimateTxSize(selectedUtxos.length, changeOutputs.length + 1) * satsPerByte
  );
}
