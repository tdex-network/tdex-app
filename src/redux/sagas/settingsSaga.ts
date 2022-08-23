import { KeyboardStyle } from '@capacitor/keyboard';
import { takeLatest, call, put, all } from 'redux-saga/effects';
import type { NetworkString } from 'tdex-sdk';

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
  setNetworkInStorage,
  getNetworkFromStorage,
  getDefaultProviderFromStorage,
  setDefaultProviderInStorage,
  setThemeInStorage,
  getThemeFromStorage,
  setElectrsBatchApiInStorage,
  getElectrsBatchApiFromStorage,
} from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import {
  setCurrency,
  setExplorerLiquidAPI,
  setExplorerBitcoinAPI,
  setExplorerLiquidUI,
  setExplorerBitcoinUI,
  setLBTCDenomination,
  setTheme,
  SET_CURRENCY,
  SET_EXPLORER_LIQUID_API,
  SET_LBTC_DENOMINATION,
  SET_THEME,
  SET_EXPLORER_BITCOIN_API,
  SET_EXPLORER_LIQUID_UI,
  SET_EXPLORER_BITCOIN_UI,
  SET_TOR_PROXY,
  setTorProxy,
  SET_NETWORK,
  setNetwork,
  setDefaultProvider,
  SET_DEFAULT_PROVIDER,
  SET_ELECTRS_BATCH_API,
  setElectrsBatchApi,
} from '../actions/settingsActions';
import type { CurrencyInterface } from '../reducers/settingsReducer';
import type { SagaGenerator } from '../types';

/* RESTORE */

export function* restoreThemeSaga(): SagaGenerator<void, string | null> {
  try {
    const theme = yield call(getThemeFromStorage);
    yield put(setTheme(theme || 'dark'));
  } catch (e) {
    console.error(e);
  }
}

export function* restoreDefaultProvider(): SagaGenerator<void, string | null> {
  try {
    const defaultProvider = yield call(getDefaultProviderFromStorage);
    if (defaultProvider) yield put(setDefaultProvider(defaultProvider));
  } catch (e) {
    console.error(e);
  }
}

export function* restoreNetwork(): SagaGenerator<void, NetworkString | null> {
  try {
    const network = yield call(getNetworkFromStorage);
    if (network) yield put(setNetwork(network));
  } catch (e) {
    console.error(e);
  }
}

export function* restoreExplorerLiquidAPI(): SagaGenerator<void, string | null> {
  try {
    const explorerEndpoint = yield call(getExplorerFromStorage);
    if (explorerEndpoint) {
      yield put(setExplorerLiquidAPI(explorerEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

export function* restoreExplorerBitcoinAPI(): SagaGenerator<void, string | null> {
  try {
    const explorerEndpoint = yield call(getExplorerBitcoinFromStorage);
    if (explorerEndpoint) {
      yield put(setExplorerBitcoinAPI(explorerEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

export function* restoreExplorerLiquidUI(): SagaGenerator<void, string | null> {
  try {
    const explorerLiquidUIEndpoint = yield call(getExplorerLiquidUIFromStorage);
    if (explorerLiquidUIEndpoint) {
      yield put(setExplorerLiquidUI(explorerLiquidUIEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

export function* restoreExplorerBitcoinUI(): SagaGenerator<void, string | null> {
  try {
    const explorerBitcoinUIEndpoint = yield call(getExplorerBitcoinUIFromStorage);
    if (explorerBitcoinUIEndpoint) {
      yield put(setExplorerBitcoinUI(explorerBitcoinUIEndpoint));
    }
  } catch (e) {
    console.error(e);
  }
}

export function* restoreElectrsBatchAPI(): SagaGenerator<void, string | null> {
  try {
    const electrsBatchAPI = yield call(getElectrsBatchApiFromStorage);
    if (electrsBatchAPI) {
      yield put(setElectrsBatchApi(electrsBatchAPI));
    }
  } catch (e) {
    console.error(e);
  }
}

export function* restoreTorProxy(): SagaGenerator<void, string | null> {
  try {
    const torProxy: string | null = yield call(getTorProxyFromStorage);
    if (torProxy) {
      yield put(setTorProxy(torProxy));
    }
  } catch (e) {
    console.error(e);
  }
}

export function* restoreDenomination(): SagaGenerator<void, string> {
  try {
    const denomination = yield call(getLBTCDenominationFromStorage);
    yield put(setLBTCDenomination(denomination));
  } catch (e) {
    console.error(e);
  }
}

export function* restoreCurrency(): SagaGenerator<void, CurrencyInterface> {
  try {
    const currency = yield call(getCurrencyFromStorage);
    yield put(setCurrency(currency));
  } catch (e) {
    console.error(e);
  }
}

/* PERSIST */

function* persistTheme(action: ActionType) {
  yield call(setThemeInStorage, action.payload);
}

function* persistDefaultProvider(action: ActionType) {
  yield call(setDefaultProviderInStorage, action.payload);
}

function* persistNetwork(action: ActionType) {
  yield call(setNetworkInStorage, action.payload);
}

function* persistExplorerLiquidAPI(action: ActionType) {
  yield call(setExplorerInStorage, action.payload);
}

function* persistExplorerBitcoinAPI(action: ActionType) {
  yield call(setExplorerBitcoinInStorage, action.payload);
}

function* persistExplorerLiquidUI(action: ActionType) {
  yield call(setExplorerLiquidUIInStorage, action.payload);
}

function* persistExplorerBitcoinUI(action: ActionType) {
  yield call(setExplorerBitcoinUIInStorage, action.payload);
}

function* persistElectrsBatchAPI(action: ActionType) {
  yield call(setElectrsBatchApiInStorage, action.payload);
}

function* persistTorProxy(action: ActionType) {
  yield call(setTorProxyInStorage, action.payload);
}

function* persistCurrency(action: ActionType) {
  yield call(setCurrencyInStorage, action.payload);
}

function* persistDenomination(action: ActionType) {
  yield call(setLBTCDenominationInStorage, action.payload);
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

export function* settingsWatcherSaga(): SagaGenerator {
  yield takeLatest(SET_LBTC_DENOMINATION, persistDenomination);
  yield takeLatest(SET_DEFAULT_PROVIDER, persistDefaultProvider);
  yield takeLatest(SET_NETWORK, persistNetwork);
  yield takeLatest(SET_EXPLORER_LIQUID_API, persistExplorerLiquidAPI);
  yield takeLatest(SET_EXPLORER_BITCOIN_API, persistExplorerBitcoinAPI);
  yield takeLatest(SET_EXPLORER_LIQUID_UI, persistExplorerLiquidUI);
  yield takeLatest(SET_EXPLORER_BITCOIN_UI, persistExplorerBitcoinUI);
  yield takeLatest(SET_ELECTRS_BATCH_API, persistElectrsBatchAPI);
  yield takeLatest(SET_TOR_PROXY, persistTorProxy);
  yield takeLatest(SET_CURRENCY, persistCurrency);
  yield takeLatest(SET_THEME, function* (action: ActionType) {
    yield all([persistTheme(action), setKeyboardStyle(action)]);
  });
}
