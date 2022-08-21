import type { AddressInterface, StateRestorerOpts } from 'ldk';
import { takeLatest, call, put, select, delay, all, takeEvery, retry } from 'redux-saga/effects';
import type { Output, UnblindedOutput } from 'tdex-sdk';
import { ElectrsBatchServer, fetchAllUtxos, utxosFetchGenerator } from 'tdex-sdk';

import { UpdateUtxosError } from '../../utils/errors';
import { blindingKeyGetterFactory } from '../../utils/helpers';
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
  setUtxo,
  unlockUtxo,
  ADD_ADDRESS,
  LOCK_UTXO,
  UPDATE_UTXOS,
  WATCH_UTXO,
  CLEAR_ADDRESSES,
} from '../actions/walletActions';
import type { WalletState } from '../reducers/walletReducer';
import { outpointToString, addressesSelector } from '../reducers/walletReducer';
import type { SagaGenerator, Unwrap } from '../types';

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
    const [addresses, utxos, explorerLiquidAPI]: [
      Record<string, AddressInterface>,
      Record<string, UnblindedOutput>,
      string
    ] = yield all([
      select(({ wallet }: { wallet: WalletState }) => wallet.addresses),
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
  addresses: Record<string, AddressInterface>,
  currentUtxos: Record<string, UnblindedOutput>,
  explorerLiquidAPI: string
): SagaGenerator<void, IteratorResult<UnblindedOutput, number>> {
  yield put(setIsFetchingUtxos(true));
  let utxoUpdatedCount = 0;
  const skippedOutpoints: string[] = []; // for deleting
  const api = ElectrsBatchServer.fromURLs('https://electrs-batch-server.vulpem.com', explorerLiquidAPI);
  const blindingKeyGetter = blindingKeyGetterFactory(addresses);
  const utxoGen = utxosFetchGenerator(
    Object.values(addresses).map((addr) => addr.confidentialAddress),
    async (script) => blindingKeyGetter(script),
    api,
    (utxo: Output) => {
      const outpoint = outpointToString(utxo);
      const skip = currentUtxos[outpoint] !== undefined;
      if (skip) skippedOutpoints.push(outpointToString(utxo));
      return skip;
    }
  );
  const next = () => utxoGen.next();
  let it = yield call(next);
  while (!it.done) {
    const utxo = it.value;
    if (!currentUtxos[outpointToString(utxo)]) {
      utxoUpdatedCount++;
      yield put(setUtxo(utxo));
    }
    it = yield call(next);
  }
  // delete spent utxos
  for (const outpoint of Object.keys(currentUtxos)) {
    if (!skippedOutpoints.includes(outpoint)) {
      const [txid, vout] = outpoint.split(':');
      utxoUpdatedCount++;
      yield put(deleteUtxo({ txid, vout: parseInt(vout) }));
    }
  }
  if (utxoUpdatedCount > 0) console.debug(`${utxoUpdatedCount} utxos updated`);
  yield put(setIsFetchingUtxos(false));
}

function* waitAndUnlock({ payload }: ReturnType<typeof unlockUtxo>) {
  if (!payload) return;
  yield delay(60_000); // 1 min
  yield put(unlockUtxo(payload));
}

function* watchUtxoSaga({ payload }: ReturnType<typeof watchUtxo>) {
  if (!payload) return;
  try {
    const { address, maxTry }: { address: AddressInterface; maxTry: number } = payload;
    const explorerLiquidAPI: string = yield select(({ settings }) => settings.explorerLiquidAPI);
    const api = ElectrsBatchServer.fromURLs('https://electrs-batch-server.vulpem.com', explorerLiquidAPI);
    const blindingKeyGetter = blindingKeyGetterFactory({
      [address.toOutputScript(address.confidentialAddress).toString('hex')]: address,
    });
    const unblindedUtxos: Unwrap<ReturnType<typeof fetchAllUtxos>> = yield retry(
      maxTry,
      2000,
      fetchAllUtxos,
      [address.confidentialAddress],
      async (script) => blindingKeyGetter(script),
      api
    );
    if (unblindedUtxos.length) {
      for (const unblindedUtxo of unblindedUtxos) {
        yield put(setUtxo(unblindedUtxo));
      }
      yield put(updateState());
    }
  } catch (err) {
    console.error(err);
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
