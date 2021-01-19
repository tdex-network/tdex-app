import { takeLatest, put, call } from 'redux-saga/effects';
import {
  INIT_APP,
  initAppFail,
  initAppSuccess,
  setSignedUp,
  SIGN_IN,
} from '../actions/appActions';
import {
  getCoinsList,
  setAddress,
  setIsAuth,
  setMnemonic,
  setAddresses,
  setWalletLoading,
} from '../actions/walletActions';
import { setProviderEndpoint } from '../actions/exchange/providerActions';
import {
  getAddress,
  getWallet,
  getCachedAddresses,
  restoreWallet,
  getIdentity,
} from '../services/walletService';
import { storageAddresses } from '../../utils/storage-helper';
import { Storage } from '@capacitor/core';
import { provider } from '../config';
import { decrypt } from '../../utils/crypto';
import { restoreTheme } from '../actions/settingsActions';

function* initAppSaga({ type }: { type: string }) {
  try {
    const walletData = yield call(getWallet);
    const walletObj = JSON.parse(walletData.value);
    if (walletObj) {
      yield put(setMnemonic(walletObj.mnemonic));
      yield put(setSignedUp(true));
    }
    yield put(restoreTheme());
    yield put(initAppSuccess());
  } catch (e) {
    yield put(initAppFail());
    console.log(e);
  }
}

function* signInSaga({ type, payload }: { type: string; payload: string }) {
  try {
    yield put(setWalletLoading(false));
    const walletData = yield call(getWallet);
    const walletObj = JSON.parse(walletData.value);
    const addressData = yield call(getAddress);
    const addressObj = JSON.parse(addressData.value);

    const addresses = yield call(getCachedAddresses);
    const mnemonic = yield call(decrypt, walletObj.mnemonic, payload);
    const identity = yield call(getIdentity, mnemonic, addresses);

    yield call(restoreWallet, identity);

    if (addressObj) {
      yield put(setAddress(addressObj));
    } else {
      const receivingAddress = identity.getNextAddress();
      Storage.set({
        key: 'address',
        value: JSON.stringify(receivingAddress),
      });
      yield put(setAddress(receivingAddress));
    }

    if (addresses) {
      yield put(setAddresses(addresses));
    } else {
      const restoredAddresses = identity.getAddresses();
      yield call(storageAddresses, restoredAddresses);
      yield put(setAddresses(restoredAddresses));
    }

    yield put(setIsAuth(true));
    yield put(setMnemonic(mnemonic));
    yield put(getCoinsList());
    yield put(setWalletLoading(true));
    yield put(setSignedUp(false));
    yield put(setProviderEndpoint(provider.endpoint));
  } catch (e) {
    yield put(initAppFail());
    yield put(setSignedUp(false));
    console.log(e);
  }
}

export function* appWatcherSaga() {
  yield takeLatest(INIT_APP, initAppSaga);
  yield takeLatest(SIGN_IN, signInSaga);
}
