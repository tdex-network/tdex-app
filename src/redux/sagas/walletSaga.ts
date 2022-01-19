import type { AddressInterface, StateRestorerOpts } from 'ldk';
import { fetchAndUnblindUtxos, fetchAndUnblindUtxosGenerator } from 'ldk';
import { takeLatest, call, put, select, delay, all, takeEvery, retry } from 'redux-saga/effects';
import type { Output, UnblindedOutput } from 'tdex-sdk';

import { UpdateUtxosError } from '../../utils/errors';
import {
  getUtxosFromStorage,
  setAddressesInStorage,
  setLastUsedIndexesInStorage,
  setUtxosInStorage,
} from '../../utils/storage-helper';
import { setIsFetchingUtxos, updateState } from '../actions/appActions';
import { addErrorToast } from '../actions/toastActions';
import type { watchUtxo } from '../actions/walletActions';
import {
  deleteUtxo,
  resetUtxos,
  setUtxo,
  unlockUtxo,
  ADD_ADDRESS,
  LOCK_UTXO,
  UPDATE_UTXOS,
  WATCH_UTXO,
  CLEAR_ADDRESSES,
} from '../actions/walletActions';
import type { WalletState } from '../reducers/walletReducer';
import { toStringOutpoint, addressesSelector } from '../reducers/walletReducer';
import type { SagaGenerator } from '../types';

export function* restoreUtxos(): SagaGenerator<void, UnblindedOutput[]> {
  const utxos = yield call(getUtxosFromStorage);
  for (const utxo of utxos) {
    yield put(setUtxo(utxo));
  }
}

function* persistAddresses() {
  const addresses: AddressInterface[] = yield select(addressesSelector);
  yield call(setAddressesInStorage, addresses);
}

function* persistLastUsedIndexes() {
  const lastIndexes: StateRestorerOpts = yield select(({ wallet }: { wallet: WalletState }) => ({
    lastUsedInternalIndex: wallet.lastUsedInternalIndex,
    lastUsedExternalIndex: wallet.lastUsedExternalIndex,
  }));
  yield call(setLastUsedIndexesInStorage, lastIndexes);
}

function* persistUtxos() {
  const utxos: UnblindedOutput[] = yield select(({ wallet }: { wallet: WalletState }) => Object.values(wallet.utxos));
  yield call(setUtxosInStorage, utxos);
}

function* updateUtxosState() {
  try {
    const [addresses, utxos, explorerLiquidAPI]: [AddressInterface[], Record<string, UnblindedOutput>, string] =
      yield all([
        select(({ wallet }: { wallet: WalletState }) => Object.values(wallet.addresses)),
        select(({ wallet }: { wallet: WalletState }) => wallet.utxos),
        select(({ settings }) => settings.explorerLiquidAPI),
      ]);
    yield call(fetchAndUpdateUtxos, addresses, utxos, explorerLiquidAPI);
  } catch (error) {
    console.error(error);
    yield put(addErrorToast(UpdateUtxosError));
  }
}

export function* fetchAndUpdateUtxos(
  addresses: AddressInterface[],
  currentUtxos: Record<string, UnblindedOutput>,
  explorerLiquidAPI: string
): SagaGenerator<void, IteratorResult<UnblindedOutput, number>> {
  yield put(setIsFetchingUtxos(true));
  const newOutpoints: string[] = [];
  const utxoGen = fetchAndUnblindUtxosGenerator(
    addresses,
    explorerLiquidAPI,
    (utxo: Output) => currentUtxos[toStringOutpoint(utxo)] !== undefined
  );
  const next = () => utxoGen.next();
  let it = yield call(next);
  // if done = true it means that we do not find any utxos
  if (it.done) {
    yield put(resetUtxos());
    yield put(setIsFetchingUtxos(false));
    return;
  }
  let utxoUpdatedCount = 0;
  while (!it.done) {
    const utxo = it.value;
    newOutpoints.push(toStringOutpoint(utxo));
    if (!currentUtxos[toStringOutpoint(utxo)]) {
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
  if (utxoUpdatedCount > 0) console.debug(`${utxoUpdatedCount} utxos updated`);
  yield put(setIsFetchingUtxos(false));
}

function* waitAndUnlock({ payload }: ReturnType<typeof unlockUtxo>) {
  yield delay(60_000); // 1 min
  yield put(unlockUtxo(payload));
}

function* watchUtxoSaga({ payload }: ReturnType<typeof watchUtxo>) {
  if (!payload) return;
  const { address, maxTry }: { address: AddressInterface; maxTry: number } = payload;
  const explorer: string = yield select(({ settings }) => settings.explorerLiquidAPI);
  const { unblindedUtxo, error }: { unblindedUtxo: UnblindedOutput; error?: { message?: string } } = yield retry(
    maxTry,
    1000,
    fetchAndUnblindUtxos,
    [address],
    explorer
  );
  error && console.error(error);
  if (!error) {
    yield put(setUtxo(unblindedUtxo));
    yield put(updateState());
  }
}

export function* walletWatcherSaga(): SagaGenerator {
  yield takeLatest([ADD_ADDRESS, CLEAR_ADDRESSES], function* () {
    yield all([persistAddresses(), persistLastUsedIndexes()]);
  });
  yield takeLatest(UPDATE_UTXOS, function* () {
    yield* updateUtxosState();
    yield* persistUtxos();
  });
  yield takeEvery(LOCK_UTXO, waitAndUnlock);
  yield takeLatest(WATCH_UTXO, watchUtxoSaga);
}
