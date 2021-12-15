import { KeyboardStyle } from '@capacitor/keyboard';
import type { GetResult } from '@capacitor/storage';
import { takeLatest, call, put } from 'redux-saga/effects';

import type { LbtcDenomination } from '../../utils/constants';
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
  getExplorerLiquidUIFromStorage,
  getExplorerBitcoinUIFromStorage,
  setExplorerLiquidUIInStorage,
  setExplorerBitcoinUIInStorage,
  setTorProxyInStorage,
  getTorProxyFromStorage,
} from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import { SIGN_IN } from '../actions/appActions';
import {
  setCurrency,
  setExplorerLiquidAPI,
  setExplorerBitcoinAPI,
  setExplorerLiquidUI,
  setExplorerBitcoinUI,
  setLBTCDenomination,
  setTheme,
  storeTheme,
  SET_CURRENCY,
  SET_EXPLORER_LIQUID_API,
  SET_LBTC_DENOMINATION,
  SET_THEME,
  STORE_THEME,
  SET_EXPLORER_BITCOIN_API,
  SET_EXPLORER_LIQUID_UI,
  SET_EXPLORER_BITCOIN_UI,
  SET_TOR_PROXY,
  setTorProxy,
} from '../actions/settingsActions';
import type { CurrencyInterface } from '../reducers/settingsReducer';
import { setThemeToStorage, getThemeFromStorage } from '../services/settingsService';

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

function* restoreExplorerLiquidAPI() {
  try {
    const explorerEndpoint: string | null = yield call(getExplorerFromStorage);
    if (explorerEndpoint) {
      yield put(setExplorerLiquidAPI(explorerEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

function* restoreExplorerBitcoinAPI() {
  try {
    const explorerEndpoint: string | null = yield call(getExplorerBitcoinFromStorage);
    if (explorerEndpoint) {
      yield put(setExplorerBitcoinAPI(explorerEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

function* restoreExplorerLiquidUI() {
  try {
    const explorerLiquidUIEndpoint: string | null = yield call(getExplorerLiquidUIFromStorage);
    if (explorerLiquidUIEndpoint) {
      yield put(setExplorerLiquidUI(explorerLiquidUIEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

function* restoreExplorerBitcoinUI() {
  try {
    const explorerBitcoinUIEndpoint: string | null = yield call(getExplorerBitcoinUIFromStorage);
    if (explorerBitcoinUIEndpoint) {
      yield put(setExplorerBitcoinUI(explorerBitcoinUIEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

function* restoreTorProxy() {
  try {
    const torProxy: string | null = yield call(getTorProxyFromStorage);
    if (torProxy) {
      yield put(setTorProxy(torProxy));
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

function* persistExplorerLiquidUI(action: ActionType) {
  yield call(setExplorerLiquidUIInStorage, action.payload);
}

function* persistExplorerBitcoinUI(action: ActionType) {
  yield call(setExplorerBitcoinUIInStorage, action.payload);
}

function* persistTorProxy(action: ActionType) {
  yield call(setTorProxyInStorage, action.payload);
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
    const denomination: LbtcDenomination = yield call(getLBTCDenominationFromStorage);
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
  yield takeLatest(SIGN_IN, restoreExplorerLiquidAPI);
  yield takeLatest(SIGN_IN, restoreExplorerBitcoinAPI);
  yield takeLatest(SIGN_IN, restoreExplorerLiquidUI);
  yield takeLatest(SIGN_IN, restoreExplorerBitcoinUI);
  yield takeLatest(SIGN_IN, restoreTorProxy);
  yield takeLatest(SIGN_IN, restoreCurrency);
  yield takeLatest(SIGN_IN, restoreDenomination);
  yield takeLatest(SET_LBTC_DENOMINATION, persistDenomination);
  yield takeLatest(SET_EXPLORER_LIQUID_API, persistExplorer);
  yield takeLatest(SET_EXPLORER_BITCOIN_API, persistExplorerBitcoin);
  yield takeLatest(SET_EXPLORER_LIQUID_UI, persistExplorerLiquidUI);
  yield takeLatest(SET_EXPLORER_BITCOIN_UI, persistExplorerBitcoinUI);
  yield takeLatest(SET_TOR_PROXY, persistTorProxy);
  yield takeLatest(SET_CURRENCY, persistCurrency);
  yield takeLatest(SET_THEME, setKeyboardStyle);
}
