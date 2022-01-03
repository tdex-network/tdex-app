import { call, put, select, takeLatest } from 'redux-saga/effects';
import type { MarketInterface, NetworkString } from 'tdex-sdk';
import { TraderClient } from 'tdex-sdk';

import { FailedToRestoreProvidersError, TDEXRegistryError } from '../../utils/errors';
import { getProvidersFromStorage, setProvidersInStorage } from '../../utils/storage-helper';
import { getProvidersFromTDexRegistry } from '../../utils/tdex';
import type { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { SIGN_IN } from '../actions/appActions';
import {
  ADD_PROVIDER,
  addMarkets,
  addProvider,
  CLEAR_PROVIDERS,
  DELETE_PROVIDER,
  UPDATE_MARKETS,
} from '../actions/tdexActions';
import { addErrorToast } from '../actions/toastActions';
import type { TDEXState } from '../reducers/tdexReducer';
import type { RootState } from '../types';

import type { SagaGenerator } from './types';

function* updateMarketsWithProvidersEndpoints() {
  const { providers, markets }: TDEXState = yield select(({ tdex }: RootState) => tdex);
  const torProxy: string = yield select(({ settings }) => settings.torProxy);
  for (const p of providers) {
    try {
      const providerMarkets: TDEXMarket[] = yield call(getMarketsFromProvider, p, torProxy);
      for (const market of providerMarkets) {
        if (!markets.find((m) => m.baseAsset === market.baseAsset && m.quoteAsset === market.quoteAsset)) {
          yield put(addMarkets([market]));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

function* fetchMarkets({ payload }: ReturnType<typeof addProvider>) {
  try {
    const torProxy: string = yield select(({ settings }) => settings.torProxy);
    const markets: TDEXMarket[] = yield call(getMarketsFromProvider, payload, torProxy);
    if (markets.length > 0) {
      yield put(addMarkets(markets));
    }
  } catch (e) {
    console.error(e);
  }
}

function* providersToRestore() {
  try {
    // try to get providers from storage
    const providersFromStorage: TDEXProvider[] = yield call(getProvidersFromStorage);
    if (providersFromStorage.length > 0) {
      return providersFromStorage;
    }
  } catch {
    yield put(addErrorToast(FailedToRestoreProvidersError));
  }
  const { network, defaultProvider }: { network: NetworkString; defaultProvider: string } = yield select(
    ({ settings }) => settings
  );
  if (network === 'liquid') {
    // try to fetch providers from registry only on liquid
    try {
      const providersFromRegistry: TDEXProvider[] = yield call(getProvidersFromTDexRegistry);
      return providersFromRegistry;
    } catch (e) {
      yield put(addErrorToast(TDEXRegistryError));
    }
  }

  // return default provider if (1) no providers in storage and (2) no providers in registry
  return [
    {
      name: 'Default provider',
      endpoint: defaultProvider,
    },
  ];
}

function* restoreProviders() {
  const providers = yield* providersToRestore();
  for (const provider of providers) {
    yield put(addProvider(provider));
  }
}

function* persistProviders() {
  const providers: TDEXProvider[] = yield select(({ tdex }: RootState) => tdex.providers);
  yield call(setProvidersInStorage, providers);
}

/**
 * make two gRPC calls in order to fetch markets and balances
 * @param p provider
 * @param torProxy
 */
async function getMarketsFromProvider(p: TDEXProvider, torProxy = 'https://proxy.tdex.network'): Promise<TDEXMarket[]> {
  const client = new TraderClient(p.endpoint, torProxy);
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

export function* tdexWatcherSaga(): SagaGenerator {
  yield takeLatest(ADD_PROVIDER, function* (action: ReturnType<typeof addProvider>) {
    yield* fetchMarkets(action);
    yield* persistProviders();
  });
  yield takeLatest([CLEAR_PROVIDERS, DELETE_PROVIDER], persistProviders);
  yield takeLatest(UPDATE_MARKETS, updateMarketsWithProvidersEndpoints);
  yield takeLatest(SIGN_IN, restoreProviders);
}
