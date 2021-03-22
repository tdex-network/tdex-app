import axios from 'axios';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { defaultPrecision } from '../../utils/constants';
import { createColorFromHash, tickerFromAssetHash } from '../../utils/helpers';
import { ADD_ASSET, setAsset } from '../actions/assetsActions';

// payload = the assetHash
function* addAssetSaga({ type, payload }: { type: string; payload: string }) {
  // check if asset already present in state
  const asset = yield select((state: any) => state.assets[payload]);
  if (!asset) {
    const explorerUrl = yield select(
      (state: any) => state.settings.explorerUrl
    );
    const { precision, ticker } = yield call(
      getAssetData,
      payload,
      explorerUrl
    );

    const setAssetAction = setAsset({
      ticker,
      precision,
      assetHash: payload,
      color: createColorFromHash(payload),
    });

    yield put(setAssetAction);
  }
}

async function getAssetData(
  assetHash: string,
  explorerURL: string
): Promise<{ precision: number; ticker: string }> {
  try {
    const { precision, ticker } = (
      await axios.get(`${explorerURL}/asset/${assetHash}`)
    ).data;
    return {
      precision: precision || defaultPrecision,
      ticker: ticker || tickerFromAssetHash(assetHash),
    };
  } catch (e) {
    console.error(e);
    return {
      precision: defaultPrecision,
      ticker: tickerFromAssetHash(assetHash),
    };
  }
}

export function* assetsWatcherSaga() {
  yield takeEvery(ADD_ASSET, addAssetSaga);
}
