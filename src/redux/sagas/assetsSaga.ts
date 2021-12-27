import axios from 'axios';
import { call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import type { NetworkString } from 'tdex-sdk';

import type { AssetConfig } from '../../utils/constants';
import { defaultPrecision } from '../../utils/constants';
import { createColorFromHash, tickerFromAssetHash } from '../../utils/helpers';
import { getAssetsFromStorage, setAssetsInStorage } from '../../utils/storage-helper';
import { SIGN_IN } from '../actions/appActions';
import { ADD_ASSET, setAsset, SET_ASSET } from '../actions/assetsActions';
import type { RootState } from '../types';

// payload = the assetHash
function* addAssetSaga({ payload }: { payload: string }) {
  // check if asset already present in state
  const { asset, network, explorerLiquidAPI } = yield select(({ assets, settings }: RootState) => ({
    asset: assets[payload],
    network: settings.network,
    explorerLiquidAPI: settings.explorerLiquidAPI,
  }));
  if (!asset) {
    const { precision, ticker, name } = yield call(getAssetData, payload, explorerLiquidAPI, network);
    const setAssetAction = setAsset({
      ticker,
      precision,
      assetHash: payload,
      color: createColorFromHash(payload, network),
      name,
    });

    yield put(setAssetAction);
  }
}

async function getAssetData(
  assetHash: string,
  explorerLiquidAPI: string,
  network: NetworkString
): Promise<{ precision: number; ticker: string; name: string }> {
  try {
    const { precision, ticker, name } = (await axios.get(`${explorerLiquidAPI}/asset/${assetHash}`)).data;
    return {
      precision: precision ?? defaultPrecision,
      ticker: ticker || tickerFromAssetHash(network, assetHash),
      name: name || '',
    };
  } catch (e) {
    console.error(e);
    return {
      precision: defaultPrecision,
      ticker: tickerFromAssetHash(network, assetHash),
      name: '',
    };
  }
}

function* persistAssets() {
  yield delay(5_000);
  const currentAssets: AssetConfig[] = yield select(({ assets }: { assets: Record<string, AssetConfig> }) =>
    Object.values(assets)
  );
  yield call(setAssetsInStorage, currentAssets);
}

function* restoreAssets() {
  const assets: AssetConfig[] = yield call(getAssetsFromStorage);
  for (const asset of assets) {
    yield put(setAsset(asset));
  }
}

export function* assetsWatcherSaga(): Generator<any, any, any> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  yield takeEvery(ADD_ASSET, addAssetSaga);
  yield takeLatest(SET_ASSET, persistAssets);
  yield takeLatest(SIGN_IN, restoreAssets);
}
