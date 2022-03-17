import { all, call, put, select, takeLatest, retry } from 'redux-saga/effects';
import type { MarketInterface, NetworkString } from 'tdex-sdk';
import { TraderClient } from 'tdex-sdk';

import { FailedToRestoreProvidersError, TDEXRegistryError } from '../../utils/errors';
import { getProvidersFromStorage, setProvidersInStorage } from '../../utils/storage-helper';
import { getProvidersFromTDexRegistry } from '../../utils/tdex';
import type { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { setIsFetchingMarkets } from '../actions/appActions';
import { addAsset } from '../actions/assetsActions';
import {
  ADD_PROVIDERS,
  addProviders,
  CLEAR_PROVIDERS,
  DELETE_PROVIDER,
  replaceMarketsOfProvider,
  UPDATE_MARKETS,
  updateMarkets,
} from '../actions/tdexActions';
import { addErrorToast } from '../actions/toastActions';
import type { RootState, SagaGenerator, Unwrap } from '../types';

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
  if (network === 'liquid' || network === 'testnet') {
    try {
      const providersFromRegistry: TDEXProvider[] = yield call(getProvidersFromTDexRegistry, network);
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

export function* restoreProviders(): SagaGenerator<
  void,
  TDEXProvider[] & { network: NetworkString; defaultProvider: string }
> {
  const providers = yield* providersToRestore();
  yield put(addProviders(providers));
}

function* persistProviders() {
  const providers: TDEXProvider[] = yield select(({ tdex }: RootState) => tdex.providers);
  yield call(setProvidersInStorage, providers);
}

function* fetchMarketsAndUpdateState() {
  function* gen(provider: TDEXProvider, torProxy: string) {
    try {
      const fetchedMarkets: Unwrap<ReturnType<typeof getMarketsFromProvider>> = yield retry(
        3,
        1000 * 2,
        getMarketsFromProvider,
        provider,
        torProxy
      );
      yield put(replaceMarketsOfProvider(provider, fetchedMarkets ?? []));
    } catch (err) {
      console.error(`Cannot get markets from provider ${provider.name} - ${provider.endpoint}`, err);
    }
  }
  try {
    yield put(setIsFetchingMarkets(true));
    const torProxy: string = yield select(({ settings }: RootState) => settings.torProxy);
    const providers: TDEXProvider[] = yield select(({ tdex }: RootState) => tdex.providers);
    yield all(providers.map((provider) => gen(provider, torProxy)));
    yield put(setIsFetchingMarkets(false));
  } catch (err) {
    console.error('fetchMarkets error: ', err);
    yield put(setIsFetchingMarkets(false));
  }
}

/**
 * make two gRPC calls in order to fetch markets and balances
 * @param p provider
 * @param torProxy
 */
async function getMarketsFromProvider(
  p: TDEXProvider,
  torProxy = 'https://proxy.tdex.network'
): Promise<TDEXMarket[] | void> {
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

function* updateAssetsFromMarkets() {
  const markets: TDEXMarket[] = yield select(({ tdex }: RootState) => tdex.markets);
  const assetsFromAllMarkets = markets.flatMap(({ baseAsset, quoteAsset }) => [baseAsset, quoteAsset]);
  const assetsFromAllMarketsUnique = [...new Set(assetsFromAllMarkets)];
  for (const asset of assetsFromAllMarketsUnique) {
    yield put(addAsset(asset));
  }
}

export function* tdexWatcherSaga(): SagaGenerator {
  yield takeLatest(ADD_PROVIDERS, function* () {
    yield* persistProviders();
    yield put(updateMarkets());
  });
  yield takeLatest([CLEAR_PROVIDERS, DELETE_PROVIDER], persistProviders);
  yield takeLatest(UPDATE_MARKETS, function* () {
    yield* fetchMarketsAndUpdateState();
    yield* updateAssetsFromMarkets();
  });
}
