import { SIGN_IN } from './../actions/appActions';
import {
  addProvider,
  clearMarkets,
  DELETE_PROVIDER,
} from './../actions/tdexActions';
import { TDEXState } from '../reducers/tdexReducer';
import {
  addMarkets,
  ADD_PROVIDER,
  UPDATE_MARKETS,
} from '../actions/tdexActions';
import { put, takeLatest, select, call, delay } from 'redux-saga/effects';
import { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { TraderClient, MarketInterface } from 'tdex-sdk';
import { addErrorToast, addSuccessToast } from '../actions/toastActions';
import {
  getProvidersFromStorage,
  setProvidersInStorage,
} from '../../utils/storage-helper';

function* updateMarketsWithProvidersEndpoints() {
  const providers: TDEXProvider[] = yield select(
    ({ tdex }: { tdex: TDEXState }) => tdex.providers
  );

  let hasBeenReset = false;
  for (const provider of providers) {
    try {
      const markets: TDEXMarket[] = yield call(
        getMarketsFromProvider,
        provider
      );
      if (markets.length > 0) {
        if (!hasBeenReset) {
          yield put(clearMarkets());
          hasBeenReset = true;
        }
        yield put(addMarkets(markets));
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
    const providers = yield call(getProvidersFromStorage);
    for (const provider of providers) {
      yield put(addProvider(provider));
    }
  } catch (e) {
    yield put(addErrorToast(e));
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

async function getMarketsFromProvider(
  provider: TDEXProvider
): Promise<TDEXMarket[]> {
  const client = new TraderClient(provider.endpoint);
  const markets: MarketInterface[] = await client.markets();

  return markets.map((market) => ({ ...market, provider }));
}
