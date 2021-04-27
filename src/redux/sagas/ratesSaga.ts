import {
  CoinGeckoPriceResult,
  getPriceFromCoinGecko,
} from './../services/ratesService';
import { setLBTCPrices, UPDATE_PRICES } from './../actions/ratesActions';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import { ActionType } from '../../utils/types';
import { setPrices } from '../actions/ratesActions';

function* fetchRates({ type }: ActionType) {
  const currency = yield select((state: any) => state.settings.currency.value);
  const currencies = [currency];
  if (currency !== 'btc') {
    currencies.push('btc');
  }

  const coinGeckoResult: CoinGeckoPriceResult = yield call(
    getPriceFromCoinGecko,
    currencies
  );

  const prices: Record<string, number> = {};
  const lbtcPrices: Record<string, number> = {};

  for (const crypto of Object.keys(coinGeckoResult)) {
    prices[crypto] = coinGeckoResult[crypto][currency];
    lbtcPrices[crypto] = coinGeckoResult[crypto]['btc'];
  }

  yield put(setPrices(prices));
  yield put(setLBTCPrices(lbtcPrices));
}

export function* ratesWatcherSaga() {
  yield takeLatest(UPDATE_PRICES, fetchRates);
}
