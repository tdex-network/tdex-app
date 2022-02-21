import axios from 'axios';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import type { NetworkString } from 'tdex-sdk';

import type { AssetConfig } from '../../utils/constants';
import { defaultPrecision, LBTC_ASSET, USDT_ASSET } from '../../utils/constants';
import { isLbtc, isUsdt } from '../../utils/helpers';
import { clearAssetsInStorage, getAssetsFromStorage, setAssetsInStorage } from '../../utils/storage-helper';
import type { addAsset } from '../actions/assetsActions';
import { ADD_ASSET, setAsset, SET_ASSET, RESET_ASSETS } from '../actions/assetsActions';
import type { RootState, SagaGenerator, Unwrap } from '../types';

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

function* addAssetSaga({ payload: assetHash }: ReturnType<typeof addAsset>) {
  if (!assetHash) return;
  // check if asset already present in state
  const { asset, explorerLiquidAPI, network } = yield select(({ assets, settings }: RootState) => ({
    asset: assets[assetHash],
    explorerLiquidAPI: settings.explorerLiquidAPI,
    network: settings.network,
  }));
  if (!asset) {
    const assetData: Unwrap<ReturnType<typeof getAssetData>> = yield call(
      getAssetData,
      assetHash,
      explorerLiquidAPI,
      network
    );
    if (assetData) {
      yield put(
        setAsset({
          ticker: assetData.ticker,
          precision: assetData.precision,
          assetHash: assetHash,
          name: assetData.name,
          coinGeckoID: assetData?.coinGeckoID,
        })
      );
    }
  }
}

export async function getAssetData(
  assetHash: string,
  explorerLiquidAPI: string,
  network: NetworkString
): Promise<AssetConfig | undefined> {
  try {
    // Return constants to include coinGeckoID field
    if (isLbtc(assetHash, network)) return LBTC_ASSET[network];
    if (isUsdt(assetHash, network)) return USDT_ASSET[network];
    //
    const { precision, ticker, name } = (await axios.get(`${explorerLiquidAPI}/asset/${assetHash}`)).data;
    return {
      assetHash: assetHash,
      precision: precision ?? defaultPrecision,
      ticker: ticker || assetHash.slice(0, 4).toUpperCase(),
      name: name,
    };
  } catch (e) {
    console.error(e);
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
