import { SIGN_IN } from './../actions/appActions';
import { addProvider, DELETE_PROVIDER } from './../actions/tdexActions';
import { TDEXState } from '../reducers/tdexReducer';
import {
  addMarkets,
  ADD_PROVIDER,
  UPDATE_MARKETS,
} from '../actions/tdexActions';
import { put, takeLatest, select, call, delay } from 'redux-saga/effects';
import { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { TraderClient, MarketInterface } from 'tdex-sdk';
import { addErrorToast } from '../actions/toastActions';
import {
  getProvidersFromStorage,
  setProvidersInStorage,
} from '../../utils/storage-helper';
import { getProvidersFromTDexRegistry } from '../../utils/tdex';
import { defaultProvider } from '../config';

function* updateMarketsWithProvidersEndpoints() {
  const { providers, markets }: TDEXState = yield select(
    ({ tdex }: { tdex: TDEXState }) => tdex
  );

  for (const p of providers) {
    try {
      const providerMarkets: TDEXMarket[] = yield call(
        getMarketsFromProvider,
        p
      );

      for (const market of providerMarkets) {
        if (
          !markets.find(
            (m) =>
              m.baseAsset === market.baseAsset &&
              m.quoteAsset === market.quoteAsset &&
              m.provider.id === market.provider.id
          )
        ) {
          yield put(addMarkets([market]));
        }
      }
    } catch (e) {
      yield put(addErrorToast(e.message || e));
    }
  }
}

function* fetchMarkets({
  type,
  payload,
}: {
  type: string;
  payload: TDEXProvider;
}) {
  try {
    const markets = yield call(getMarketsFromProvider, payload);
    if (markets.length > 0) {
      yield put(addMarkets(markets));
    }
  } catch (e) {
    yield put(addErrorToast(e.message || e));
  }
}

function* restoreProviders() {
  try {
    // restore the providers from storage
    const providers: TDEXProvider[] = yield call(getProvidersFromStorage);
    for (const p of providers) {
      yield put(addProvider(p));
    }

    try {
      const providersFromRegistry: TDEXProvider[] = yield call(
        getProvidersFromTDexRegistry
      );
      const filteredProviders = providersFromRegistry.filter(
        (prov: TDEXProvider) =>
          providers.find((p) => p.endpoint === prov.endpoint) === undefined
      );

      for (const p of filteredProviders) {
        yield put(addProvider(p));
      }
    } catch (e) {
      console.error(e);
      yield put(addErrorToast('Unable to fetch providers from registry'));
    }
  } catch (e) {
    console.error(e);
    yield put(addErrorToast(e));
    // if an error happen, add the default provider (depends on config)
    yield put(
      addProvider({
        name: 'Default provider',
        endpoint: defaultProvider.endpoint,
      })
    );
  }
}

function* persistProviders() {
  yield delay(2000);
  const providers: TDEXProvider[] = yield select(
    ({ tdex }: { tdex: TDEXState }) => tdex.providers
  );
  yield call(setProvidersInStorage, providers);
}

export function* tdexWatcherSaga() {
  yield takeLatest(ADD_PROVIDER, persistProviders);
  yield takeLatest(DELETE_PROVIDER, persistProviders);
  yield takeLatest(ADD_PROVIDER, fetchMarkets);
  yield takeLatest(UPDATE_MARKETS, updateMarketsWithProvidersEndpoints);
  yield takeLatest(SIGN_IN, restoreProviders);
}

/**
 * make two gRPC calls in order to fetch markets and balances
 * @param p provider
 */
async function getMarketsFromProvider(p: TDEXProvider): Promise<TDEXMarket[]> {
  const client = new TraderClient(p.endpoint);
  const markets: MarketInterface[] = await client.markets();
  const results: TDEXMarket[] = [];

  for (const market of markets) {
    const balance = (await client.balances(market))[0].balance;
    results.push({
      ...market,
      provider: p,
      baseAmount: balance?.baseAmount,
      quoteAmount: balance?.quoteAmount,
    });
  }

  return results;
}
