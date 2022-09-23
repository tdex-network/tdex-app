import type { AddressInterface } from 'ldk';
import { takeLatest, takeLeading, put, call, all, select } from 'redux-saga/effects';

import { seedBackupFlag } from '../../utils/storage-helper';
import type { signIn } from '../actions/appActions';
import {
  INIT_APP,
  initAppFail,
  initAppSuccess,
  setSignedUp,
  SIGN_IN,
  UPDATE,
  setIsBackupDone,
  setIsFetchingUtxos,
  INIT_APP_SUCCESS,
} from '../actions/appActions';
import { checkIfClaimablePeginUtxo, updateDepositPeginUtxos, watchCurrentBtcBlockHeight } from '../actions/btcActions';
import { updatePrices } from '../actions/ratesActions';
import { updateMarkets } from '../actions/tdexActions';
import { updateTransactions } from '../actions/transactionsActions';
import { addAddress, setIsAuth, setMasterPublicKeysFromMnemonic, updateUtxos } from '../actions/walletActions';
import { isMasterPublicKey, isMnemonic } from '../reducers/walletReducer';
import { restoreFromMasterPubKey, restoreFromMnemonic } from '../services/walletService';
import type { RootState, SagaGenerator } from '../types';

import { restoreAssets } from './assetsSaga';
import { restorePegins } from './btcSaga';
import {
  restoreCurrency,
  restoreDefaultProvider,
  restoreDenomination,
  restoreElectrsBatchAPI,
  restoreExplorerBitcoinAPI,
  restoreExplorerBitcoinUI,
  restoreExplorerLiquidAPI,
  restoreExplorerLiquidUI,
  restoreNetwork,
  restoreThemeSaga,
  restoreTorProxy,
} from './settingsSaga';
import { restoreProviders } from './tdexSaga';
import { restoreTransactions } from './transactionsSaga';
import { restoreUtxos } from './walletSaga';

function* initAppSaga() {
  try {
    yield put(setSignedUp(true));
    yield put(initAppSuccess());
  } catch (e) {
    yield put(setSignedUp(false));
    yield put(initAppFail());
    console.error(e);
  }
}

function* signInSaga({ payload: identity }: ReturnType<typeof signIn>) {
  try {
    if (!identity) throw new Error('No identity');
    // Start by setting isAuth to true, which causes redirection to auth guarded pages
    yield put(setIsAuth(true));
    // Get backup flag from storage and set Redux state
    const backup: boolean = yield call(seedBackupFlag);
    if (backup) yield put(setIsBackupDone(true));
    // Wallet Restoration
    const explorerLiquidAPI: string = yield select(({ settings }: RootState) => settings.explorerLiquidAPI);
    if (isMasterPublicKey(identity)) {
      yield call(restoreFromMasterPubKey, identity, explorerLiquidAPI);
    }
    if (isMnemonic(identity)) {
      yield all([
        call(restoreFromMnemonic, identity, explorerLiquidAPI),
        put(setMasterPublicKeysFromMnemonic(identity)),
      ]);
    }
    const addresses: AddressInterface[] = yield call(() => identity.getAddresses());
    for (const addr of addresses) {
      yield put(addAddress(addr));
    }
    yield all([
      put(watchCurrentBtcBlockHeight()),
      put(updateDepositPeginUtxos()),
      put(checkIfClaimablePeginUtxo()),
      put(updateTransactions()),
      put(updatePrices()),
      put(updateUtxos()),
    ]);
  } catch (e) {
    yield put(initAppFail());
    console.error(e);
  }
}

// Triggered by <Refresher />
function* updateState() {
  yield put(setIsFetchingUtxos(true));
  yield all([
    put(watchCurrentBtcBlockHeight()),
    put(updateDepositPeginUtxos()),
    put(checkIfClaimablePeginUtxo()),
    put(updateMarkets()),
    put(updateTransactions()),
    put(updatePrices()),
    put(updateUtxos()),
  ]);
}

export function* appWatcherSaga(): SagaGenerator {
  yield takeLatest(INIT_APP, initAppSaga);
  // Restore providers, pegins, assets, txs, utxos and user settings before signing in
  yield takeLatest(INIT_APP_SUCCESS, function* () {
    yield all([
      restoreProviders(),
      restorePegins(),
      restoreAssets(),
      restoreUtxos(),
      restoreTransactions(),
      restoreNetwork(),
      restoreExplorerLiquidAPI(),
      restoreExplorerBitcoinAPI(),
      restoreExplorerLiquidUI(),
      restoreExplorerBitcoinUI(),
      restoreElectrsBatchAPI(),
      restoreDefaultProvider(),
      restoreTorProxy(),
      restoreCurrency(),
      restoreDenomination(),
      restoreThemeSaga(),
    ]);
  });
  yield takeLatest(SIGN_IN, signInSaga);
  yield takeLeading(UPDATE, updateState);
}
