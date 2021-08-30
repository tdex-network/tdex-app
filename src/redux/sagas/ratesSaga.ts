import { takeLatest, call, put, select } from 'redux-saga/effects';

import { setLBTCPrices, setPrices, UPDATE_PRICES } from '../actions/ratesActions';
import type { CurrencyInterface, SettingsState } from '../reducers/settingsReducer';
import { getPriceFromCoinGecko } from '../services/ratesService';
import type { CoinGeckoPriceResult } from '../services/ratesService';

function* fetchRates() {
  try {
    const currency: CurrencyInterface['value'] = yield select(
      ({ settings }: { settings: SettingsState }) => settings.currency.value
    );
    const currencies = [currency];
    if (currency !== 'btc') {
      currencies.push('btc');
    }
    const coinGeckoResult: CoinGeckoPriceResult = yield call(getPriceFromCoinGecko, currencies);
    const prices: Record<string, number> = {};
    const lbtcPrices: Record<string, number> = {};
    for (const crypto of Object.keys(coinGeckoResult)) {
      prices[crypto] = coinGeckoResult[crypto][currency];
      lbtcPrices[crypto] = coinGeckoResult[crypto]['btc'];
    }
    yield put(setPrices(prices));
    yield put(setLBTCPrices(lbtcPrices));
  } catch (err) {
    console.error(err);
  }
}

export function* ratesWatcherSaga(): Generator<any, any, any> {
  yield takeLatest(UPDATE_PRICES, fetchRates);
}
