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
  setAddresses,
  setWalletLoading,
} from '../actions/walletActions';
import {
  getAddress,
  getWallet,
  getAddresses,
  explorerUrl,
  restoreWallet,
} from '../services/walletService';
import { IdentityRestorerFromState } from '../../utils/identity-restorer';
import { storageAddresses } from '../../utils/storage-helper';
import { EsploraIdentityRestorer, IdentityType, Mnemonic } from 'tdex-sdk';
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
    yield put(setWalletLoading(false));
    const addressData = yield call(getAddress);
    const addressesData = yield call(getAddresses);
    const addressObj = JSON.parse(addressData.value);
    const addressesArray = JSON.parse(addressesData.value);
    const identity = new Mnemonic({
      chain: 'regtest',
      type: IdentityType.Mnemonic,
      value: {
        mnemonic: decrypt(walletObj.mnemonic, walletObj.pin),
      },
      initializeFromRestorer: true,
      restorer: addressesArray
        ? new IdentityRestorerFromState(addressesArray)
        : new EsploraIdentityRestorer(explorerUrl),
    });
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
    if (addressesArray) {
      yield put(setAddresses(addressesArray));
    } else {
      const addresses = identity.getAddresses();
      yield call(storageAddresses, addresses);
      yield put(setAddresses(addresses));
    }
    yield put(setIdentity(identity));
    yield put(setIsAuth(true));
    yield put(setMnemonic(walletObj.mnemonic));
    yield put(setPin(walletObj.pin));
    yield put(getCoinsList());
    yield put(setWalletLoading(true));
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
