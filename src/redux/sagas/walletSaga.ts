import type { AddressInterface, StateRestorerOpts, UtxoInterface } from 'ldk';
import {
  fetchAndUnblindUtxosGenerator,
  fetchUtxos,
  fetchPrevoutAndTryToUnblindUtxo,
} from 'ldk';
import {
  takeLatest,
  call,
  put,
  select,
  delay,
  all,
  takeEvery,
} from 'redux-saga/effects';

import { UpdateUtxosError } from '../../utils/errors';
import {
  getUtxosFromStorage,
  setAddressesInStorage,
  setLastUsedIndexesInStorage,
  setUtxosInStorage,
} from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import { setIsFetchingUtxos, SIGN_IN } from '../actions/appActions';
import { addErrorToast } from '../actions/toastActions';
import {
  UPDATE_UTXOS,
  setUtxo,
  deleteUtxo,
  resetUtxos,
  LOCK_UTXO,
  unlockUtxo,
  ADD_ADDRESS,
  WATCH_UTXO,
} from '../actions/walletActions';
import type { WalletState } from '../reducers/walletReducer';
import { outpointToString, addressesSelector } from '../reducers/walletReducer';

function* persistAddresses() {
  const addresses: AddressInterface[] = yield select(addressesSelector);
  yield call(setAddressesInStorage, addresses);
}

function* persistLastUsedIndexes() {
  const lastIndexes: StateRestorerOpts = yield select(
    ({ wallet }: { wallet: WalletState }) => ({
      lastUsedInternalIndex: wallet.lastUsedInternalIndex,
      lastUsedExternalIndex: wallet.lastUsedExternalIndex,
    }),
  );
  yield call(setLastUsedIndexesInStorage, lastIndexes);
}

function* updateUtxosState() {
  try {
    const [addresses, utxos, explorerURL]: [
      AddressInterface[],
      Record<string, UtxoInterface>,
      string,
    ] = yield all([
      select(({ wallet }: { wallet: WalletState }) =>
        Object.values(wallet.addresses),
      ),
      select(({ wallet }: { wallet: WalletState }) => wallet.utxos),
      select(({ settings }) => settings.explorerUrl),
    ]);
    yield call(fetchAndUpdateUtxos, addresses, utxos, explorerURL);
  } catch (error) {
    console.error(error);
    yield put(addErrorToast(UpdateUtxosError));
  }
}

export function* fetchAndUpdateUtxos(
  addresses: AddressInterface[],
  currentUtxos: Record<string, UtxoInterface>,
  explorerUrl: string,
): any {
  const newOutpoints: string[] = [];

  const utxoGen = fetchAndUnblindUtxosGenerator(
    addresses,
    explorerUrl,
    (utxo: UtxoInterface) => currentUtxos[outpointToString(utxo)] != undefined,
  );
  const next = () => utxoGen.next();

  let it: IteratorResult<UtxoInterface, number> = yield call(next);

  // if done = true it means that we do not find any utxos
  if (it.done) {
    yield put(resetUtxos());
    yield put(setIsFetchingUtxos(false));
    return;
  }

  let utxoUpdatedCount = 0;

  while (!it.done) {
    const utxo = it.value;
    newOutpoints.push(outpointToString(utxo));
    if (!currentUtxos[outpointToString(utxo)]) {
      utxoUpdatedCount++;
      yield put(setUtxo(utxo));
    }
    it = yield call(next);
  }

  // delete spent utxos
  for (const outpoint of Object.keys(currentUtxos)) {
    if (outpoint && !newOutpoints.includes(outpoint)) {
      const [txid, vout] = outpoint.split(':');
      utxoUpdatedCount++;
      yield put(deleteUtxo({ txid, vout: parseInt(vout) }));
    }
  }

  if (utxoUpdatedCount > 0) {
    console.debug(`${utxoUpdatedCount} utxos updated`);
  }
  yield put(setIsFetchingUtxos(false));
}

function* waitAndUnlock({ payload }: { payload: string }) {
  yield delay(60_000); // 1 min
  yield put(unlockUtxo(payload));
}

function* persistUtxos() {
  yield delay(20_000); // 20 sec
  const utxos: UtxoInterface[] = yield select(
    ({ wallet }: { wallet: WalletState }) => Object.values(wallet.utxos),
  );
  yield call(setUtxosInStorage, utxos);
}

function* restoreUtxos() {
  const utxos: UtxoInterface[] = yield call(getUtxosFromStorage);
  for (const utxo of utxos) {
    yield put(setUtxo(utxo));
  }
}

function* watchUtxoSaga(action: ActionType) {
  const { address, maxTry }: { address: AddressInterface; maxTry: number } =
    action.payload;
  const explorer: string = yield select(({ settings }) => settings.explorerUrl);

  for (let t = 0; t < maxTry; t++) {
    try {
      const utxos: UtxoInterface[] = yield call(
        fetchUtxos,
        address.confidentialAddress,
        explorer,
      );
      if (utxos.length === 0) throw new Error();
      const {
        unblindedUtxo,
        error,
      }: { unblindedUtxo: UtxoInterface; error?: { message?: string } } =
        yield call(
          fetchPrevoutAndTryToUnblindUtxo,
          utxos[0],
          address.blindingPrivateKey,
          explorer,
        );
      error && console.error(error);
      yield put(setUtxo(unblindedUtxo));
      break;
    } catch {
      yield delay(1_000);
    }
  }
}

export function* walletWatcherSaga(): Generator {
  yield takeLatest(ADD_ADDRESS, persistAddresses);
  yield takeLatest(ADD_ADDRESS, persistLastUsedIndexes);
  yield takeLatest(UPDATE_UTXOS, updateUtxosState);
  yield takeLatest(UPDATE_UTXOS, persistUtxos);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  yield takeEvery(LOCK_UTXO, waitAndUnlock);
  yield takeLatest(SIGN_IN, restoreUtxos);
  yield takeLatest(WATCH_UTXO, watchUtxoSaga);
}
