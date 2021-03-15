import { takeLatest, call, put } from 'redux-saga/effects';
import {
  setTheme,
  STORE_THEME,
  RESTORE_THEME,
} from '../actions/settingsActions';
import { ActionType } from '../../utils/types';
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

function* restoreThemeSaga(action: ActionType) {
  try {
    const data = yield call(getThemeFromStorage);
    const theme = data.value || 'dark';
    yield put(setTheme(theme));
  } catch (e) {
    console.error(e);
  }
}

export function* settingsWatcherSaga() {
  yield takeLatest(STORE_THEME, storeThemeSaga);
  yield takeLatest(RESTORE_THEME, restoreThemeSaga);
}
