import { waitForRestore } from './../services/walletService';
import { takeLatest, put, call } from 'redux-saga/effects';
import {
  INIT_APP,
  initAppFail,
  initAppSuccess,
  setSignedUp,
  SIGN_IN,
} from '../actions/appActions';
import {
  setAddresses,
  setIsAuth,
  setWalletLoading,
} from '../actions/walletActions';
import { setProviderEndpoint } from '../actions/exchange/providerActions';
import { provider } from '../config';
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

function* signInSaga({ type, payload }: { type: string; payload: string }) {
  try {
    yield put(setWalletLoading(false));
    const identity: Mnemonic = yield call(getIdentity, payload);
    yield call(waitForRestore, identity);
    const addresses = identity.getAddresses();
    yield put(setAddresses(addresses));

    yield put(setIsAuth(true));
    yield put(setWalletLoading(true));
    yield put(setProviderEndpoint(provider.endpoint));
  } catch (e) {
    yield put(initAppFail());
    console.error(e);
  }
}

export function* appWatcherSaga() {
  yield takeLatest(INIT_APP, initAppSaga);
  yield takeLatest(SIGN_IN, signInSaga);
}
