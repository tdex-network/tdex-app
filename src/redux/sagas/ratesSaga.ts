import {
  CoinGeckoPriceResult,
  getPriceFromCoinGecko,
} from './../services/ratesService';
import { UPDATE_RATES } from './../actions/ratesActions';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import { ActionType } from '../../utils/types';
import { setRates } from '../actions/ratesActions';

function* fetchRates({ type }: ActionType) {
  const currency = yield select((state: any) => state.settings.currency);
  const coinGeckoResult: CoinGeckoPriceResult = yield call(
    getPriceFromCoinGecko,
    [currency]
  );
  const rates: Record<string, number> = {};
  for (const crypto of Object.keys(coinGeckoResult)) {
    rates[crypto] = coinGeckoResult[crypto][currency];
  }

  yield put(setRates(rates));
}

export function* ratesWatcherSaga() {
  yield takeLatest(UPDATE_RATES, fetchRates);
}
