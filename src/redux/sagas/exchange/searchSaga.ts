import { takeLatest, put, select } from 'redux-saga/effects';
import { ActionType } from '../../../utils/types';
import {
  SHOW_SEARCH,
  setSearchAssetList,
} from '../../../redux/actions/exchange/searchActions';

function* makeAssetsListSaga({ payload }: ActionType) {
  const { providerAssets, sendAsset } = yield select((state: any) => ({
    providerAssets: state.exchange.provider.assets,
    sendAsset: state.exchange.trade.sendAsset,
  }));

  const assets =
    payload == 'send'
      ? providerAssets
      : providerAssets.filter((asset: any) => asset.id != sendAsset);

  yield put(setSearchAssetList(assets));
}

export function* searchWatcherSaga() {
  yield takeLatest(SHOW_SEARCH, makeAssetsListSaga);
}
