import { takeLatest, call, put, select } from 'redux-saga/effects';
import { ActionType } from '../../utils/types';
import {
  GET_RATES,
  cacheCoingeckoCoins,
  setRates,
} from '../actions/ratesActions';
import { fetchCoinList, fetchRates } from '../services/ratesService';

function* getRatesSaga({ payload }: ActionType) {
  let coins = yield select((state: any) => state.rates.coingeckoCache);

  if (!coins) {
    coins = yield call(fetchCoinList);
    yield put(cacheCoingeckoCoins(coins));
  }

  const { tickers, currencies } = payload;
  const rates = yield call(fetchRates, tickers, currencies, coins);
  yield put(setRates(rates));
}

export function* ratesWatcherSaga() {
  yield takeLatest(GET_RATES, getRatesSaga);
}
