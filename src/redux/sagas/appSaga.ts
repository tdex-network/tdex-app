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
  setIdentity,
} from '../actions/walletActions';
import { getAddress, getWallet } from '../services/walletService';
import { IdentityType, Mnemonic } from 'tdex-sdk';
import { Storage } from '@capacitor/core';
import { decrypt } from '../../utils/crypto';

function* initAppSaga({ type }: { type: string }) {
  try {
    const walletData = yield call(getWallet);
    const walletObj = JSON.parse(walletData.value);
    if (walletObj) {
      yield put(setMnemonic(walletObj.mnemonic));
      yield put(setSignedUp(true));
    }
    yield put(initAppSuccess());
  } catch (e) {
    yield put(initAppFail());
    console.log(e);
  }
}

function* signInSaga({ type, payload }: { type: string; payload: string }) {
  try {
    const walletData = yield call(getWallet);
    const walletObj = JSON.parse(walletData.value);
    const addressData = yield call(getAddress);
    const addressObj = JSON.parse(addressData.value);
    const identity = new Mnemonic({
      chain: 'regtest',
      type: IdentityType.Mnemonic,
      value: {
        mnemonic: decrypt(walletObj.mnemonic, payload),
      },
      initializeFromRestorer: false, // Scan the blockchain and restore previous addresses
      // restorer: new EsploraIdentityRestorer(explorerUrl),
    });
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
    yield put(setIdentity(identity));
    yield put(getCoinsList());
    yield put(setIsAuth(true));
    yield put(setSignedUp(false));
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
