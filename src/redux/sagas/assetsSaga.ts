import axios from 'axios';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import type { NetworkString } from 'tdex-sdk';

import type { AssetConfig } from '../../utils/constants';
import { defaultPrecision, LBTC_TICKER } from '../../utils/constants';
import { isLbtc } from '../../utils/helpers';
import { clearAssetsInStorage, getAssetsFromStorage, setAssetsInStorage } from '../../utils/storage-helper';
import type { addAsset } from '../actions/assetsActions';
import { ADD_ASSET, setAsset, SET_ASSET, RESET_ASSETS } from '../actions/assetsActions';
import type { RootState, SagaGenerator } from '../types';

export function* restoreAssets(): SagaGenerator<void, AssetConfig[]> {
  const assets = yield call(getAssetsFromStorage);
  for (const asset of assets) {
    yield put(setAsset(asset));
  }
}

function* persistAssets() {
  const currentAssets: AssetConfig[] = yield select(({ assets }: { assets: Record<string, AssetConfig> }) =>
    Object.values(assets)
  );
  yield call(setAssetsInStorage, currentAssets);
}

function* addAssetSaga({ payload }: ReturnType<typeof addAsset>) {
  if (!payload) return;
  // check if asset already present in state
  const { asset, network, explorerLiquidAPI } = yield select(({ assets, settings }: RootState) => ({
    asset: assets[payload],
    network: settings.network,
    explorerLiquidAPI: settings.explorerLiquidAPI,
  }));
  if (!asset) {
    const { precision, ticker, name } = yield call(getAssetData, payload, explorerLiquidAPI, network);
    yield put(
      setAsset({
        ticker,
        precision,
        assetHash: payload,
        name,
      })
    );
  }
}

export async function getAssetData(
  assetHash: string,
  explorerLiquidAPI: string,
  network: NetworkString
): Promise<AssetConfig | undefined> {
  try {
    if (isLbtc(assetHash, network)) {
      return {
        assetHash: assetHash,
        precision: 8,
        ticker: LBTC_TICKER[network],
        name: 'Liquid Bitcoin',
      };
    }
    const { precision, ticker, name } = (await axios.get(`${explorerLiquidAPI}/asset/${assetHash}`)).data;
    return {
      assetHash: assetHash,
      precision: precision ?? defaultPrecision,
      ticker: ticker || assetHash.slice(0, 4).toUpperCase(),
      name: name,
    };
  } catch (e) {
    console.error(e);
    return;
  }
}

function* resetAssets() {
  yield call(clearAssetsInStorage);
}

export function* assetsWatcherSaga(): SagaGenerator {
  yield takeEvery(ADD_ASSET, addAssetSaga);
  yield takeLatest(SET_ASSET, persistAssets);
  yield takeLatest(RESET_ASSETS, resetAssets);
}
