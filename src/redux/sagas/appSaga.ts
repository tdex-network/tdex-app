import { takeLatest, put, call } from 'redux-saga/effects';
import { INIT_APP, initAppFail, initAppSuccess } from '../actions/appActions';
import {
  getCoinsList,
  setAddress,
  setIsAuth,
  setMnemonic,
  setIdentity,
  setAddresses,
} from '../actions/walletActions';
import {
  getAddress,
  getWallet,
  getAddresses,
  explorerUrl,
  restoreWallet,
} from '../services/walletService';
import { IdentityType, Mnemonic, EsploraIdentityRestorer } from 'tdex-sdk';
import { Storage } from '@capacitor/core';

function* initAppSaga({ type }: { type: string }) {
  try {
    const walletData = yield call(getWallet);
    const walletObj = JSON.parse(walletData.value);
    if (walletObj) {
      const addressData = yield call(getAddress);
      const addressesData = yield call(getAddresses);
      const addressObj = JSON.parse(addressData.value);
      const addressesArray = JSON.parse(addressesData.value);
      const identity = new Mnemonic({
        chain: 'regtest',
        type: IdentityType.Mnemonic,
        value: {
          mnemonic: walletObj.mnemonic,
        },
        ...(addressesArray
          ? {}
          : {
              initializeFromRestorer: true,
              restorer: new EsploraIdentityRestorer(explorerUrl),
            }),
      });
      if (addressesArray) {
        yield put(setAddresses(addressesArray));
      } else {
        yield call(restoreWallet, identity);
        const addresses = identity.getAddresses();
        Storage.set({
          key: 'addresses',
          value: JSON.stringify(addresses),
        });
        yield put(setAddresses(addresses));
      }
      if (addressObj) {
        yield put(setAddress(addressObj));
      } else {
        const receivingAddress = identity.getNextAddress();
        Storage.set({
          key: 'address',
          value: JSON.stringify(receivingAddress),
        });
        yield put(setIdentity(identity));
        yield put(setAddress(receivingAddress));
      }
      yield put(setIsAuth(true));
      yield put(setMnemonic(walletObj.mnemonic));
      yield put(getCoinsList());
    } else {
      yield put(initAppSuccess());
    }
  } catch (e) {
    yield put(initAppFail());
    console.log(e);
  }
}

export function* appWatcherSaga() {
  yield takeLatest(INIT_APP, initAppSaga);
}
