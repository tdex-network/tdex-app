import type { Mnemonic } from 'ldk';
import { takeLatest, put, call, all, select } from 'redux-saga/effects';

import { getIdentity, seedBackupFlag } from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import {
  INIT_APP,
  initAppFail,
  initAppSuccess,
  setSignedUp,
  SIGN_IN,
  UPDATE,
  setIsBackupDone,
} from '../actions/appActions';
import { updatePrices } from '../actions/ratesActions';
import { updateMarkets } from '../actions/tdexActions';
import { updateTransactions } from '../actions/transactionsActions';
import {
  addAddress,
  setIsAuth,
  setPublicKeys,
  updateUtxos,
} from '../actions/walletActions';
import { waitForRestore } from '../services/walletService';

function* initAppSaga() {
  try {
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
    const explorerUrl = yield select(
      (state: any) => state.settings.explorerUrl,
    );
    yield all([
      call(waitForRestore, identity, explorerUrl),
      put(setPublicKeys(identity)),
    ]);
    const addresses = yield call(() => identity.getAddresses());
    for (const addr of addresses) {
      yield put(addAddress(addr));
    }

    // Get backup flag from storage and set Redux state
    const backup = yield call(seedBackupFlag);
    if (backup) {
      yield put(setIsBackupDone(true));
    }

    yield put(setIsAuth(true));
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
    put(updatePrices()),
    put(updateUtxos()),
  ]);
}

export function* appWatcherSaga(): Generator<any, any, any> {
  yield takeLatest(INIT_APP, initAppSaga);
  yield takeLatest(SIGN_IN, signInSaga);
  yield takeLatest(UPDATE, updateState);
}
