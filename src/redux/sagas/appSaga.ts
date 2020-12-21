import { takeLatest, put, call } from 'redux-saga/effects';
import { INIT_APP, initAppFail, initAppSuccess } from '../actions/appActions';
import {
  getCoinsList,
  setAddress,
  setIsAuth,
  setMnemonic,
  setPin,
  setIdentity,
} from '../actions/walletActions';
import {
  getAddress,
  getWallet,
  explorerUrl,
  restoreWallet,
} from '../services/walletService';
import { EsploraIdentityRestorer, IdentityType, Mnemonic } from 'tdex-sdk';
import { Storage } from '@capacitor/core';
import { decrypt } from '../../utils/crypto';

function* initAppSaga({ type }: { type: string }) {
  try {
    const walletData = yield call(getWallet);
    const walletObj = JSON.parse(walletData.value);
    if (walletObj) {
      const addressData = yield call(getAddress);
      const addressObj = JSON.parse(addressData.value);
      const identity = new Mnemonic({
        chain: 'regtest',
        type: IdentityType.Mnemonic,
        value: {
          mnemonic: decrypt(walletObj.mnemonic, walletObj.pin),
        },
        initializeFromRestorer: false, // Scan the blockchain and restore previous addresses
        // restorer: new EsploraIdentityRestorer(explorerUrl),
      });
      // try {
      //   yield call(restoreWallet, identity);
      // } catch (e) {
      //   console.log(e);
      // }
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
      yield put(setIsAuth(true));
      yield put(setMnemonic(walletObj.mnemonic));
      yield put(setPin(walletObj.pin));
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
