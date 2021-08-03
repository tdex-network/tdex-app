import axios from 'axios';
import type { UtxoInterface } from 'ldk';
import { fetchUtxos } from 'ldk';
import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects';

import { UpdateUtxosError } from '../../utils/errors';
import {
  getPeginsFromStorage,
  setPeginsInStorage,
  setUtxosBtcInStorage,
} from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import { SIGN_IN } from '../actions/appActions';
import {
  CLAIM_PEGINS,
  setCurrentBtcBlockHeight,
  setUtxoBtc,
  UPDATE_UTXOS_BTC,
  UPSERT_PEGINS,
  upsertPegins,
  WATCH_CURRENT_BTC_BLOCK_HEIGHT,
  WATCH_UTXO_BTC,
} from '../actions/btcActions';
import { addErrorToast } from '../actions/toastActions';
import type {
  BtcState,
  DepositPeginUtxos,
  Pegins,
} from '../reducers/btcReducer';
import { outpointToString } from '../reducers/walletReducer';

function* persistPegins() {
  const pegins: Pegins = yield select(state => state.btc.pegins);
  yield call(setPeginsInStorage, pegins);
}

// function* claimPegins() {
//   const pegins: Pegins = yield select(state => state.btc.pegins);
//   const btcCurrentBlockHeight: number = yield select(
//     state => state.btc.currentBlockHeight,
//   );
//   yield call(setPeginsInStorage, pegins);
// }

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

function* persistUtxosBtc() {
  yield delay(15_000);
  const depositPeginUtxos: UtxoInterface[] = yield select(
    ({ btc }: { btc: BtcState }) => Object.values(btc.depositPeginUtxos),
  );
  yield call(setUtxosBtcInStorage, depositPeginUtxos);
}

function* updateUtxosBtcState() {
  try {
    const [btcDepositAddresses, depositPeginUtxos, explorerBitcoinURL]: [
      string[],
      DepositPeginUtxos,
      string,
    ] = yield all([
      select(({ btc }: { btc: BtcState }) =>
        Object.values(btc.pegins)
          .map(p => {
            // If pegin not already claimed, check its address for deposit
            if (!p.claimTxId) {
              return p.depositAddress.address;
            }
            return undefined;
          })
          .filter(addr => addr !== undefined),
      ),
      select(({ btc }: { btc: BtcState }) => btc.depositPeginUtxos),
      select(({ settings }) => settings.explorerBitcoinUrl),
    ]);
    yield call(
      fetchAndUpdateUtxosBtc,
      btcDepositAddresses,
      depositPeginUtxos,
      explorerBitcoinURL,
    );
  } catch (error) {
    console.error(error);
    yield put(addErrorToast(UpdateUtxosError));
  }
}

export function* fetchAndUpdateUtxosBtc(
  btcAddresses: string[],
  currentUtxos: DepositPeginUtxos,
  explorerBitcoinUrl: string,
): any {
  if (!btcAddresses.length) return;
  let utxos;
  for (const btcAddress of btcAddresses) {
    utxos = yield call(fetchUtxos, btcAddress, explorerBitcoinUrl);
  }
  if (utxos.length === 0) return;
  let utxoBtcUpdatedCount = 0;
  for (const utxo of utxos) {
    if (
      !currentUtxos[outpointToString(utxo)] ||
      !currentUtxos[outpointToString(utxo)].status.confirmed
    ) {
      utxoBtcUpdatedCount++;
      yield put(setUtxoBtc(utxo));
    }
  }
  if (utxoBtcUpdatedCount > 0) {
    console.debug(`${utxoBtcUpdatedCount} btc utxos updated`);
  }
}

function* watchUtxoBtcSaga(action: ActionType) {
  const { btcAddress, maxTry }: { btcAddress: string; maxTry: number } =
    action.payload;
  const explorerBitcoinUrl: string = yield select(
    ({ settings }) => settings.explorerBitcoinUrl,
  );
  for (let t = 0; t < maxTry; t++) {
    try {
      const utxos: UtxoInterface[] = yield call(
        fetchUtxos,
        btcAddress,
        explorerBitcoinUrl,
      );
      if (utxos.length === 0) throw new Error();
      yield put(setUtxoBtc(utxos[0]));
      break;
    } catch {
      yield delay(1_000);
    }
  }
}

export function* btcWatcherSaga(): Generator {
  yield takeLatest(SIGN_IN, restorePegins);
  yield takeLatest(UPDATE_UTXOS_BTC, updateUtxosBtcState);
  yield takeLatest(UPDATE_UTXOS_BTC, persistUtxosBtc);
  yield takeLatest(WATCH_UTXO_BTC, watchUtxoBtcSaga);
  yield takeLatest(WATCH_CURRENT_BTC_BLOCK_HEIGHT, watchCurrentBtcBlockHeight);
  yield takeLatest(UPSERT_PEGINS, persistPegins);
  //yield takeLatest(CLAIM_PEGINS, claimPegins);
}
