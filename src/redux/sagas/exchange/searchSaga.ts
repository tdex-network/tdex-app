import { takeLatest, put, select, call } from 'redux-saga/effects';
import {
  SHOW_SEARCH,
  SEARCH_ASSET,
  setSearchAssetList,
} from '../../actions/exchange/searchActions';
import { filterAssetsForSearch } from '../../services/exchange/searchService';

function* makeAssetsListSaga() {
  const {
    party,
    sendAsset,
    assetsById,
    providerAssetIds,
    query,
  } = yield select((state: any) => ({
    party: state.exchange.search.party,
    sendAsset: state.exchange.trade.sendAsset,
    assetsById: state.assets.byId,
    providerAssetIds: state.exchange.provider.assetIds,
    query: state.exchange.search.query,
  }));

  const exclude = party == 'receive' ? sendAsset : null;
  const filteredAssets: any = yield call(
    filterAssetsForSearch,
    assetsById,
    providerAssetIds,
    query,
    exclude
  );

  yield put(setSearchAssetList(filteredAssets));
}

export function* searchWatcherSaga() {
  yield takeLatest([SEARCH_ASSET, SHOW_SEARCH], makeAssetsListSaga);
}
