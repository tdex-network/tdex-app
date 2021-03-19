import axios from 'axios';
import { useSelector } from 'react-redux';
import { call, put, takeEvery } from 'redux-saga/effects';
import { defaultPrecision } from '../../utils/constants';
import { createColorFromHash } from '../../utils/helpers';
import { ADD_ASSET, setAsset } from '../actions/assetsActions';
import { tickerFromAssetHash } from '../reducers/walletReducer';

// payload = the assetHash
function* addAssetSaga({ type, payload }: { type: string; payload: string }) {
  // check if asset already present in state
  const asset = useSelector((state: any) => state.assets[payload]);
  if (!asset) {
    const explorerUrl = useSelector((state: any) => state.settings.explorerUrl);
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
  const { precision, ticker } = (await axios.get(`${explorerURL}`)).data;
  return {
    precision: precision || defaultPrecision,
    ticker: ticker || tickerFromAssetHash(assetHash),
  };
}

export function* assetsWatcherSaga() {
  yield takeEvery(ADD_ASSET, addAssetSaga);
}
