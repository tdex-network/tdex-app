import { takeLatest, call, put } from 'redux-saga/effects';
import { ActionType } from '../../utils/types';
import { SET_ASSETS, setAssets } from '../actions/assetsActions';
import { getCoinRates } from '../actions/ratesActions';
import { fetchAssets } from '../services/assetsService';

function* setAssetsSaga({ payload }: ActionType) {
  yield put(getCoinRates(['usdt', 'lbtc'], ['eur']));
}

export function* assetsWatcherSaga() {
  yield takeLatest(SET_ASSETS, setAssetsSaga);
}
