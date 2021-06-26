import type { AddressInterface } from 'ldk';
import {
  takeLatest,
  takeLeading,
  put,
  call,
  all,
  select,
} from 'redux-saga/effects';

import { seedBackupFlag } from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import {
  INIT_APP,
  initAppFail,
  initAppSuccess,
  setSignedUp,
  SIGN_IN,
  UPDATE,
  setIsBackupDone,
  setIsFetchingUtxos,
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
    // Start by setting isAuth to true, which causes redirection to auth guarded pages
    yield put(setIsAuth(true));
    // Get backup flag from storage and set Redux state
    const backup: boolean = yield call(seedBackupFlag);
    if (backup) yield put(setIsBackupDone(true));
    // Wallet Restoration
    yield setIsFetchingUtxos(true);
    const explorerUrl: string = yield select(
      (state: any) => state.settings.explorerUrl,
    );
    yield all([
      call(waitForRestore, action.payload.mnemonic, explorerUrl),
      put(setPublicKeys(action.payload.mnemonic)),
    ]);
    const addresses: AddressInterface[] = yield call(() =>
      action.payload.mnemonic.getAddresses(),
    );
    for (const addr of addresses) {
      yield put(addAddress(addr));
    }
    // Update all state
    yield updateState();
  } catch (e) {
    yield put(initAppFail());
    console.error(e);
  }
}

// Triggered by <Refresher />
function* updateState() {
  yield put(setIsFetchingUtxos(true));
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
  yield takeLeading(UPDATE, updateState);
}
