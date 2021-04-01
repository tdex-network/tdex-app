import {
  setElectrumServer,
  SET_ELECTRUM_SERVER,
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
  getExplorerFromStorage,
  setExplorerInStorage,
} from '../../utils/storage-helper';

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

export function* settingsWatcherSaga() {
  yield takeLatest(STORE_THEME, storeThemeSaga);
  yield takeLatest(SIGN_IN, restoreThemeSaga);
  yield takeLatest(SIGN_IN, restoreExplorer);
  yield takeLatest(SET_ELECTRUM_SERVER, persistExplorer);
}
