import { TDEXState } from '../reducers/tdexReducer';
import {
  ADD_PROVIDER,
  setMarkets,
  updateMarkets,
  UPDATE_MARKETS,
} from '../actions/tdexActions';
import { put, takeLatest, select, call, all } from 'redux-saga/effects';
import { TDEXMarket, TDEXProvider } from '../actionTypes/tdexActionTypes';
import { TraderClient, MarketInterface } from 'tdex-sdk';
import { addErrorToast } from '../actions/toastActions';

function* updateMarketsWithProvidersEndpoints() {
  try {
    const providers: TDEXProvider[] = yield select(
      ({ tdex }: { tdex: TDEXState }) => tdex.providers
    );
    const markets = ((yield all(
      providers.map((provider) => call(getMarketsFromProvider, provider))
    )) as TDEXMarket[][]).flat();
    yield put(setMarkets(markets));
  } catch (e) {
    yield put(addErrorToast(e.message || e));
  }
}

function* putUpdateMarkets() {
  yield put(updateMarkets());
}

export function* tdexWatcherSaga() {
  yield takeLatest(ADD_PROVIDER, putUpdateMarkets);
  yield takeLatest(UPDATE_MARKETS, updateMarketsWithProvidersEndpoints);
}

async function getMarketsFromProvider(
  provider: TDEXProvider
): Promise<TDEXMarket[]> {
  const client = new TraderClient(provider.endpoint);
  const markets: MarketInterface[] = await client.markets();

  return markets.map((market) => ({ ...market, provider }));
}
