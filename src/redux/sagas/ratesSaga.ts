import { takeLatest, call, put, select } from 'redux-saga/effects';
import type { NetworkString } from 'tdex-sdk';

import { setLBTCPrices, setPrices, UPDATE_PRICES } from '../actions/ratesActions';
import type { CurrencyInterface } from '../reducers/settingsReducer';
import { getPriceFromCoinGecko } from '../services/ratesService';
import type { CoinGeckoPriceResult } from '../services/ratesService';
import type { RootState, SagaGenerator } from '../types';

function* fetchRates() {
  try {
    const { currency, network }: { currency: CurrencyInterface['value']; network: NetworkString } = yield select(
      ({ settings }: RootState) => ({
        currency: settings.currency.value,
        network: settings.network,
      })
    );
    const currencies = [currency];
    if (currency !== 'btc') {
      currencies.push('btc');
    }
    const coinGeckoResult: CoinGeckoPriceResult = yield call(getPriceFromCoinGecko, currencies, network);
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

export function* ratesWatcherSaga(): SagaGenerator {
  yield takeLatest(UPDATE_PRICES, fetchRates);
}
