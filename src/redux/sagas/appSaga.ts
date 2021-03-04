import { updateMarkets } from './../actions/tdexActions';
import { setPublicKeys } from './../actions/walletActions';
import { ActionType } from './../../utils/types';
import { waitForRestore } from './../services/walletService';
import { takeLatest, put, call, all } from 'redux-saga/effects';
import {
  INIT_APP,
  initAppFail,
  initAppSuccess,
  setSignedUp,
  SIGN_IN,
} from '../actions/appActions';
import { setAddresses, setIsAuth } from '../actions/walletActions';
import { restoreTheme } from '../actions/settingsActions';
import { Mnemonic } from 'ldk';
import { getIdentity } from '../../utils/storage-helper';

function* initAppSaga() {
  try {
    yield put(restoreTheme());
    yield put(initAppSuccess());
    yield put(setSignedUp(true));
  } catch (e) {
    yield put(setSignedUp(false));
    yield put(initAppFail());
    console.error(e);
  }
}

function* signInSaga(action: ActionType) {
  try {
    const identity: Mnemonic = yield call(getIdentity, action.payload);
    yield all([call(waitForRestore, identity), put(setPublicKeys(identity))]);

    const addresses = identity.getAddresses();
    yield put(setAddresses(addresses));

    yield all([put(setIsAuth(true))]);
    yield put(updateMarkets());
  } catch (e) {
    yield put(initAppFail());
    console.error(e);
  }
}

export function* appWatcherSaga() {
  yield takeLatest(INIT_APP, initAppSaga);
  yield takeLatest(SIGN_IN, signInSaga);
}
