import { updateMarkets } from './../actions/tdexActions';
import {
  addAddress,
  setPublicKeys,
  updateUtxos,
} from './../actions/walletActions';
import { ActionType } from './../../utils/types';
import { waitForRestore } from './../services/walletService';
import { takeLatest, put, call, all } from 'redux-saga/effects';
import {
  INIT_APP,
  initAppFail,
  initAppSuccess,
  setSignedUp,
  SIGN_IN,
  UPDATE,
  setBackupDone,
} from '../actions/appActions';
import { setIsAuth } from '../actions/walletActions';
import { restoreTheme } from '../actions/settingsActions';
import { Mnemonic } from 'ldk';
import { getIdentity, seedBackupFlag } from '../../utils/storage-helper';
import { updateTransactions } from '../actions/transactionsActions';
import { updateRates } from '../actions/ratesActions';

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
    for (const addr of addresses) {
      yield put(addAddress(addr));
    }

    // set the backup flag
    const backup = yield call(seedBackupFlag);
    if (backup) {
      yield put(setBackupDone());
    }

    yield all([put(setIsAuth(true))]);
    yield put(updateMarkets());
  } catch (e) {
    yield put(initAppFail());
    console.error(e);
  }
}

function* updateState() {
  yield all([
    put(updateMarkets()),
    put(updateTransactions()),
    put(updateRates()),
    put(updateUtxos()),
  ]);
}

export function* appWatcherSaga() {
  yield takeLatest(INIT_APP, initAppSaga);
  yield takeLatest(SIGN_IN, signInSaga);
  yield takeLatest(UPDATE, updateState);
}
