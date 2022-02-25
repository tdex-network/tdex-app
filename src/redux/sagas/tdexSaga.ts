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
  addMarkets,
  addProviders,
  CLEAR_PROVIDERS,
  DELETE_PROVIDER,
  UPDATE_MARKETS,
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

function* fetchMarketsAndAddToState() {
  function* gen(provider: TDEXProvider, torProxy: string, marketsInState: TDEXMarket[]) {
    const fetchedMarkets: Unwrap<ReturnType<typeof getMarketsFromProvider>> = yield retry(
      3,
      1000 * 2,
      getMarketsFromProvider,
      provider,
      torProxy
    );
    if (fetchedMarkets?.length) {
      let isMarketInState = false;
      for (const fetchedMarket of fetchedMarkets) {
        isMarketInState = marketsInState.some(
          (marketInState) =>
            fetchedMarket.baseAsset === marketInState.baseAsset && fetchedMarket.quoteAsset === marketInState.quoteAsset
        );
        if (!isMarketInState) yield put(addMarkets([fetchedMarket]));
      }
    }
  }
  try {
    yield put(setIsFetchingMarkets(true));
    const { torProxy, providers, markets }: { torProxy: string; markets: TDEXMarket[]; providers: TDEXProvider[] } =
      yield select(({ settings, tdex }: RootState) => ({
        torProxy: settings.torProxy,
        markets: tdex.markets,
        providers: tdex.providers,
      }));
    yield all(providers.map((provider) => gen(provider, torProxy, markets)));
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
  try {
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
  } catch (err) {
    console.error(`Cannot get markets from provider ${p.name} - ${p.endpoint}`, err);
  }
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
    yield* fetchMarketsAndAddToState();
    yield* persistProviders();
  });
  yield takeLatest([CLEAR_PROVIDERS, DELETE_PROVIDER], persistProviders);
  yield takeLatest(UPDATE_MARKETS, function* () {
    yield* fetchMarketsAndAddToState();
    yield* updateAssetsFromMarkets();
  });
}
