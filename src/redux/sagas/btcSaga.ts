import axios from 'axios';
import { fetchUtxos } from 'ldk';
import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects';

import { UpdateUtxosError } from '../../utils/errors';
import {
  getPeginsFromStorage,
  setPeginsInStorage,
} from '../../utils/storage-helper';
import { SIGN_IN } from '../actions/appActions';
import {
  setCurrentBtcBlockHeight,
  setDepositPeginUtxo,
  UPDATE_DEPOSIT_PEGIN_UTXOS,
  UPSERT_PEGINS,
  upsertPegins,
  WATCH_CURRENT_BTC_BLOCK_HEIGHT,
} from '../actions/btcActions';
import { addErrorToast } from '../actions/toastActions';
import type { BtcState, Pegin, Pegins } from '../reducers/btcReducer';
import { outpointToString } from '../reducers/walletReducer';

// function* claimPeginsSaga() {
//   const pegins: Pegins = yield select(state => state.btc.pegins);
//   const explorerBitcoinUrl: string = yield select(
//     state => state.settings.explorerBitcoinUrl,
//   );
//   const explorerUrl: string = yield select(state => state.settings.explorerUrl);
//   const btcCurrentBlockHeight: number = yield select(
//     state => state.btc.currentBlockHeight,
//   );
//   yield call(claimPeginsFn, explorerBitcoinUrl, explorerUrl, pegins, '');
// }
//
// async function claimPeginsFn(
//   explorerBitcoinUrl: string,
//   explorerUrl: string,
//   pendingPegins: Pegins,
//   mnemonic: Mnemonic,
// ) {
//   await claimPegin(explorerBitcoinUrl, explorerUrl, pendingPegins, mnemonic);
// }

function* getClaimablePegins() {
  const pegins: Pegins = yield select(
    ({ btc }: { btc: BtcState }) => btc.pegins,
  );
  const explorerBitcoinUrl: string = yield select(
    (state: any) => state.settings.explorerBitcoinUrl,
  );
  const { currentBlockHeight } = yield call(
    getCurrentBtcBlockHeight,
    explorerBitcoinUrl,
  );
  return Object.values(pegins)
    .map(pegin => {
      // Check if already claimed
      if (pegin.claimTxId) return undefined;
      // Check if pegin is claimable
      const utxos = Object.values(pegin.depositUtxos ?? []);
      const peginHasMatureUtxo = utxos.some(
        utxo => currentBlockHeight - utxo.status.block_height > 101,
      );
      if (peginHasMatureUtxo) return pegin;
      return undefined;
    })
    .filter((pegin): pegin is Pegin => Boolean(pegin));
}

function* persistPegins() {
  yield delay(5_000);
  const pegins: Pegins = yield select(state => state.btc.pegins);
  yield call(setPeginsInStorage, pegins);
}

function* restorePegins() {
  const pegins: Pegins = yield call(getPeginsFromStorage);
  yield put(upsertPegins(pegins));
}

// Fetch block height continuously every minute
function* watchCurrentBtcBlockHeight() {
  const explorerBitcoinUrl: string = yield select(
    (state: any) => state.settings.explorerBitcoinUrl,
  );
  const { currentBlockHeight } = yield call(
    getCurrentBtcBlockHeight,
    explorerBitcoinUrl,
  );
  const setCurrentBtcBlockHeightAction =
    setCurrentBtcBlockHeight(currentBlockHeight);
  yield put(setCurrentBtcBlockHeightAction);
  yield delay(60_000);
  yield put({ type: 'WATCH_CURRENT_BTC_BLOCK_HEIGHT' });
}

async function getCurrentBtcBlockHeight(
  explorerBitcoinURL: string,
): Promise<{ currentBlockHeight: number }> {
  let currentBlockHeight;
  try {
    currentBlockHeight = (
      await axios.get(`${explorerBitcoinURL}/blocks/tip/height`)
    ).data;
  } catch (err) {
    console.error(err);
  }
  return { currentBlockHeight };
}

function* updateDepositPeginUtxosState() {
  try {
    const [pegins, explorerBitcoinURL]: [Pegins, string] = yield all([
      select(({ btc }: { btc: BtcState }) => btc.pegins),
      select(({ settings }) => settings.explorerBitcoinUrl),
    ]);
    yield call(fetchAndUpdateDepositPeginUtxos, pegins, explorerBitcoinURL);
  } catch (error) {
    console.error(error);
    yield put(addErrorToast(UpdateUtxosError));
  }
}

export function* fetchAndUpdateDepositPeginUtxos(
  pegins: Pegins,
  explorerBitcoinUrl: string,
): any {
  const depositAddresses = Object.values(pegins).map(p => p.depositAddress);
  if (!depositAddresses.length) return;
  let utxos;
  let utxoBtcUpdatedCount = 0;
  for (const claimScript in pegins) {
    utxos = yield call(
      fetchUtxos,
      pegins[claimScript].depositAddress.address,
      explorerBitcoinUrl,
    );
    if (utxos.length === 0) continue;
    for (const utxo of utxos) {
      if (
        !pegins[claimScript].depositUtxos?.[outpointToString(utxo)] ||
        !pegins[claimScript].depositUtxos?.[outpointToString(utxo)].status
          .confirmed
      ) {
        utxoBtcUpdatedCount++;
        yield put(
          setDepositPeginUtxo(utxo, pegins[claimScript].depositAddress),
        );
      }
    }
  }
  if (utxoBtcUpdatedCount > 0) {
    console.debug(`${utxoBtcUpdatedCount} btc utxos updated`);
  }
}

export function* btcWatcherSaga(): Generator {
  yield takeLatest(SIGN_IN, restorePegins);
  yield takeLatest(UPDATE_DEPOSIT_PEGIN_UTXOS, updateDepositPeginUtxosState);
  yield takeLatest(UPDATE_DEPOSIT_PEGIN_UTXOS, persistPegins);
  yield takeLatest(WATCH_CURRENT_BTC_BLOCK_HEIGHT, watchCurrentBtcBlockHeight);
  yield takeLatest(UPSERT_PEGINS, persistPegins);
  //yield takeLatest(CLAIM_PEGINS, claimPeginsSaga);
}
