import { takeLatest, put, call } from 'redux-saga/effects';
import { INIT_APP, initAppFail, initAppSuccess } from '../actions/appActions';
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
import { IdentityType, Mnemonic, EsploraIdentityRestorer } from 'tdex-sdk';
import { Storage } from '@capacitor/core';
import { IdentityRestorerFromState } from '../../utils/identity-restorer';
import { storageAddresses } from '../../utils/storage-helper';

function* initAppSaga({ type }: { type: string }) {
  try {
    const walletData = yield call(getWallet);
    const walletObj = JSON.parse(walletData.value);
    if (walletObj) {
      yield put(setWalletLoading(false));
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
        storageAddresses(addresses);
      }
      yield put(setIdentity(identity));
      yield put(setIsAuth(true));
      yield put(setMnemonic(walletObj.mnemonic));
      yield put(getCoinsList());
      yield put(setWalletLoading(true));
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
