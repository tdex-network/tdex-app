import { takeLatest, put, select } from 'redux-saga/effects';
import {
  SHOW_SEARCH,
  SEARCH_ASSET,
  setSearchAssetList,
} from '../../../redux/actions/exchange/searchActions';
import { filterAssetsForSearch } from '../../../redux/services/exchange/searchService';

function* makeAssetsListSaga() {
  const { assets, sendAsset, party, query } = yield select((state: any) => ({
    assets: state.exchange.provider.assets,
    sendAsset: state.exchange.trade.sendAsset,
    party: state.exchange.search.party,
    query: state.exchange.search.query,
  }));

  const exclude = party == 'receive' ? sendAsset : null;
  const filteredAssets = filterAssetsForSearch(assets, { query, exclude });

  yield put(setSearchAssetList(filteredAssets));
}

export function* searchWatcherSaga() {
  yield takeLatest([SEARCH_ASSET, SHOW_SEARCH], makeAssetsListSaga);
}
