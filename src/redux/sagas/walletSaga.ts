import { takeLatest, call, put, all, select } from 'redux-saga/effects';
import {
  GET_ASSETS,
  GET_COINS_LIST,
  setAssets,
  setCoinsList,
  setCoinsRates,
} from '../actions/walletActions';
import { BalanceInterface } from '../actionTypes/walletActionTypes';
import {
  assetTransformer,
  coinsTransformer,
} from '../transformers/walletTransformers';
import { getAssetsRequest, getCoinsRequest } from '../services/walletService';

function* getAssetSaga({
  type,
  payload,
}: {
  type: string;
  payload: BalanceInterface;
}) {
  try {
    const { currency, coinsList } = yield select((state: any) => ({
      coinsList: state.wallet.coinsList,
      currency: state.settings.currency,
    }));
    const callArray = Object.keys(payload).map((assetId: string) =>
      call(getAssetsRequest, `/asset/${assetId}`)
    );
    const assetArray = yield all(callArray);
    const transformedAssets = assetTransformer(assetArray, payload);
    const coinsArray = [];
    for (let i = 0; i < coinsList.length; i++) {
      const currentCoin = coinsList[i];
      const asset = transformedAssets.find((assetItem: any) => {
        if (assetItem.ticker === 'LBTC' && currentCoin.symbol === 'btc') {
          return true;
        }
        return (
          assetItem.ticker?.toLowerCase() === currentCoin.symbol &&
          currentCoin.symbol !== 'lbtc'
        );
      });
      if (asset) {
        coinsArray.push(currentCoin);
      } else if (currentCoin.symbol === 'btc') {
        coinsArray.push(currentCoin);
      }
      if (coinsArray.length === assetArray.length) break;
    }
    const coinsIds = coinsArray.reduce((a: string, b: any) => {
      return a ? `${a},${b.id}` : b.id;
    }, '');
    const coinsRateOptions = {
      params: {
        ids: coinsIds.indexOf('bitcoin') < 0 ? `${coinsIds},bitcoin` : coinsIds,
        vs_currencies: currency.toLowerCase(),
      },
    };
    yield call(getCoinsRatesSaga, coinsRateOptions, coinsArray, currency);
    yield put(setAssets(transformedAssets));
  } catch (e) {
    yield put(setAssets([]));
    yield put(setCoinsRates(null));
    console.log(e);
  }
}

function* getCoinsRatesSaga(
  coinsRatesOptions: any,
  coinsArray: Array<any>,
  currency: string
) {
  try {
    const { data: coinsData } = yield call(
      getCoinsRequest,
      '/simple/price',
      coinsRatesOptions
    );
    yield put(setCoinsRates(coinsTransformer(coinsArray, coinsData, currency)));
  } catch (e) {
    console.log(e);
  }
}

function* getCoinsListSaga({ type }: { type: string }) {
  try {
    const { data } = yield call(getCoinsRequest, '/coins/list');
    yield put(setCoinsList(data));
  } catch (e) {
    console.log(e);
  }
}

export function* walletWatcherSaga() {
  yield takeLatest(GET_ASSETS, getAssetSaga);
  yield takeLatest(GET_COINS_LIST, getCoinsListSaga);
}
