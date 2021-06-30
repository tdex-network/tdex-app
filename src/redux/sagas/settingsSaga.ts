import { KeyboardStyle } from '@capacitor/keyboard';
import type { GetResult } from '@capacitor/storage';
import { takeLatest, call, put } from 'redux-saga/effects';

import { setKeyboardTheme } from '../../utils/keyboard';
import {
  getCurrencyFromStorage,
  getExplorerFromStorage,
  getExplorerBitcoinFromStorage,
  getLBTCDenominationFromStorage,
  setCurrencyInStorage,
  setExplorerInStorage,
  setExplorerBitcoinInStorage,
  setLBTCDenominationInStorage,
} from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import { SIGN_IN } from '../actions/appActions';
import {
  setCurrency,
  setElectrumServer,
  setExplorerBitcoin,
  setLBTCDenomination,
  setTheme,
  storeTheme,
  SET_CURRENCY,
  SET_ELECTRUM_SERVER,
  SET_LBTC_DENOMINATION,
  SET_THEME,
  STORE_THEME,
  SET_EXPLORER_BITCOIN,
} from '../actions/settingsActions';
import type { CurrencyInterface } from '../reducers/settingsReducer';
import {
  setThemeToStorage,
  getThemeFromStorage,
} from '../services/settingsService';

function* storeThemeSaga({ payload }: ActionType) {
  try {
    yield call(setThemeToStorage, payload);
    yield put(setTheme(payload));
  } catch (e) {
    console.error(e);
  }
}

function* restoreThemeSaga() {
  try {
    const data: GetResult = yield call(getThemeFromStorage);
    const theme = data.value || 'dark';
    if (data.value === null) {
      yield put(storeTheme(theme));
    }
    yield put(setTheme(theme));
  } catch (e) {
    console.error(e);
  }
}

function* restoreExplorer() {
  try {
    const explorerEndpoint: string | null = yield call(getExplorerFromStorage);
    if (explorerEndpoint) {
      yield put(setElectrumServer(explorerEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

function* restoreExplorerBitcoin() {
  try {
    const explorerEndpoint: string | null = yield call(
      getExplorerBitcoinFromStorage,
    );
    if (explorerEndpoint) {
      yield put(setExplorerBitcoin(explorerEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

function* persistExplorer(action: ActionType) {
  yield call(setExplorerInStorage, action.payload);
}

function* persistExplorerBitcoin(action: ActionType) {
  yield call(setExplorerBitcoinInStorage, action.payload);
}

function* persistCurrency(action: ActionType) {
  yield call(setCurrencyInStorage, action.payload);
}

function* restoreCurrency() {
  try {
    const currency: CurrencyInterface = yield call(getCurrencyFromStorage);
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
    const denomination: string = yield call(getLBTCDenominationFromStorage);
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

export function* settingsWatcherSaga(): Generator<any, any, any> {
  yield takeLatest(STORE_THEME, storeThemeSaga);
  yield takeLatest(SIGN_IN, restoreThemeSaga);
  yield takeLatest(SIGN_IN, restoreExplorer);
  yield takeLatest(SIGN_IN, restoreExplorerBitcoin);
  yield takeLatest(SIGN_IN, restoreCurrency);
  yield takeLatest(SIGN_IN, restoreDenomination);
  yield takeLatest(SET_LBTC_DENOMINATION, persistDenomination);
  yield takeLatest(SET_ELECTRUM_SERVER, persistExplorer);
  yield takeLatest(SET_EXPLORER_BITCOIN, persistExplorerBitcoin);
  yield takeLatest(SET_CURRENCY, persistCurrency);
  yield takeLatest(SET_THEME, setKeyboardStyle);
}
