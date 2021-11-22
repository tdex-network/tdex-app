import { put, takeLatest, select, call, delay } from 'redux-saga/effects';
import type { MarketInterface } from 'tdex-sdk';
import { TraderClient } from 'tdex-sdk';

import { FailedToRestoreProvidersError, TDEXRegistryError } from '../../utils/errors';
import { getProvidersFromStorage, setProvidersInStorage } from '../../utils/storage-helper';
import { getProvidersFromTDexRegistry } from '../../utils/tdex';
import type { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { SIGN_IN } from '../actions/appActions';
import { addAsset } from '../actions/assetsActions';
import { addMarkets, addProvider, ADD_PROVIDER, UPDATE_MARKETS, DELETE_PROVIDER } from '../actions/tdexActions';
import { addErrorToast } from '../actions/toastActions';
import { defaultProvider, network } from '../config';
import type { TDEXState } from '../reducers/tdexReducer';

import type { SagaGenerator } from './types';

function* updateAssetsFromMarkets(markets: TDEXMarket[]): SagaGenerator {
  const allAssets = new Set(markets.flatMap((m) => [m.baseAsset, m.quoteAsset]));
  for (const asset of allAssets) {
    yield put(addAsset(asset));
  }
}

function* updateMarketsWithProvidersEndpoints() {
  const { providers, markets }: TDEXState = yield select(({ tdex }: { tdex: TDEXState }) => tdex);
  const torProxy: string = yield select(({ settings }) => settings.torProxy);
  for (const p of providers) {
    try {
      const providerMarkets: TDEXMarket[] = yield call(getMarketsFromProvider, p, torProxy);
      const toAdd: TDEXMarket[] = [];
      for (const market of providerMarkets) {
        if (
          !markets.find(
            (m) =>
              m.baseAsset === market.baseAsset &&
              m.quoteAsset === market.quoteAsset &&
              m.provider.id === market.provider.id
          )
        ) {
          toAdd.push(market);
        }
      }
      yield* updateAssetsFromMarkets(toAdd);
      yield put(addMarkets(toAdd));
    } catch (e) {
      console.error(e);
    }
  }
}

function* fetchMarkets({ payload }: { payload: TDEXProvider }) {
  try {
    const torProxy: string = yield select(({ settings }) => settings.torProxy);
    const markets: TDEXMarket[] = yield call(getMarketsFromProvider, payload, torProxy);
    if (markets.length > 0) {
      yield* updateAssetsFromMarkets(markets);
      yield put(addMarkets(markets));
    }
  } catch (e) {
    console.error(e);
  }
}

function* providersToRestore(): SagaGenerator<TDEXProvider[], TDEXProvider[]> {
  try {
    // try to get providers from storage
    const providersFromStorage = yield call(getProvidersFromStorage);
    if (providersFromStorage.length > 0) {
      return providersFromStorage;
    }
  } catch {
    yield put(addErrorToast(FailedToRestoreProvidersError));
  }

  if (network.chain === 'liquid') {
    // try to fetch providers from registry only on liquid
    try {
      const providersFromRegistry = yield call(getProvidersFromTDexRegistry);
      return providersFromRegistry;
    } catch (e) {
      yield put(addErrorToast(TDEXRegistryError));
    }
  }

  // return default provider if (1) no providers in storage and (2) no providers in registry
  return [
    {
      name: 'Default provider',
      endpoint: defaultProvider.endpoint,
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
  yield delay(2000);
  const providers: TDEXProvider[] = yield select(({ tdex }: { tdex: TDEXState }) => tdex.providers);
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

export function* tdexWatcherSaga(): Generator<any, any, any> {
  yield takeLatest(ADD_PROVIDER, persistProviders);
  yield takeLatest(DELETE_PROVIDER, persistProviders);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  yield takeLatest(ADD_PROVIDER, fetchMarkets);
  yield takeLatest(UPDATE_MARKETS, updateMarketsWithProvidersEndpoints);
  yield takeLatest(SIGN_IN, restoreProviders);
}
