import {
  setCurrency,
  setElectrumServer,
  setLBTCDenomination,
  SET_CURRENCY,
  SET_ELECTRUM_SERVER,
  SET_LBTC_DENOMINATION,
  SET_THEME,
} from './../actions/settingsActions';
import { takeLatest, call, put } from 'redux-saga/effects';
import { setTheme, STORE_THEME } from '../actions/settingsActions';
import { ActionType } from '../../utils/types';
import {
  setThemeToStorage,
  getThemeFromStorage,
} from '../services/settingsService';
import { SIGN_IN } from '../actions/appActions';
import {
  getCurrencyFromStorage,
  getExplorerFromStorage,
  getLBTCDenominationFromStorage,
  setCurrencyInStorage,
  setExplorerInStorage,
  setLBTCDenominationInStorage,
} from '../../utils/storage-helper';
import { setKeyboardTheme } from '../../utils/keyboard';
import { KeyboardStyle } from '@capacitor/core';

function* storeThemeSaga({ payload }: ActionType) {
  try {
    yield call(setThemeToStorage, payload);
    yield put(setTheme(payload));
  } catch (e) {
    console.error(e);
  }
}

function* restoreThemeSaga(action: ActionType) {
  try {
    const data = yield call(getThemeFromStorage);
    const theme = data.value || 'dark';
    yield put(setTheme(theme));
  } catch (e) {
    console.error(e);
  }
}

function* restoreExplorer() {
  try {
    const explorerEndpoint = yield call(getExplorerFromStorage);
    if (explorerEndpoint) {
      yield put(setElectrumServer(explorerEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

function* persistExplorer(action: ActionType) {
  yield call(setExplorerInStorage, action.payload);
}

function* persistCurrency(action: ActionType) {
  yield call(setCurrencyInStorage, action.payload);
}

function* restoreCurrency() {
  try {
    const currency = yield call(getCurrencyFromStorage);
    yield put(setCurrency(currency));
  } catch (e) {
    console.error(e);
  }
}

function* persistDenomination(action: ActionType) {
  yield call(setLBTCDenominationInStorage, action.payload);
}

function* restoreDenomination() {
  try {
    const denomination = yield call(getLBTCDenominationFromStorage);
    yield put(setLBTCDenomination(denomination));
  } catch (e) {
    console.error(e);
  }
}

function* setKeyboardStyle(action: ActionType) {
  switch (action.payload) {
    case 'light':
      yield call(setKeyboardTheme, KeyboardStyle.Light);
      break;
    case 'dark':
      yield call(setKeyboardTheme, KeyboardStyle.Dark);
      break;
  }
}

export function* settingsWatcherSaga() {
  yield takeLatest(STORE_THEME, storeThemeSaga);
  yield takeLatest(SIGN_IN, restoreThemeSaga);
  yield takeLatest(SIGN_IN, restoreExplorer);
  yield takeLatest(SIGN_IN, restoreCurrency);
  yield takeLatest(SIGN_IN, restoreDenomination);
  yield takeLatest(SET_LBTC_DENOMINATION, persistDenomination);
  yield takeLatest(SET_ELECTRUM_SERVER, persistExplorer);
  yield takeLatest(SET_CURRENCY, persistCurrency);
  yield takeLatest(SET_THEME, setKeyboardStyle);
}
