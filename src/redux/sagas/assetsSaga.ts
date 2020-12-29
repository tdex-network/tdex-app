import { takeLatest, put } from 'redux-saga/effects';
import { ActionType } from '../../utils/types';
import { SET_ASSETS } from '../actions/assetsActions';
import { getCoinRates } from '../actions/ratesActions';

function* setAssetsSaga({ payload }: ActionType) {
  yield put(getCoinRates(['usdt', 'lbtc'], ['eur']));
}

export function* assetsWatcherSaga() {
  yield takeLatest(SET_ASSETS, setAssetsSaga);
}
