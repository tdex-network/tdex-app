import { updateRates } from './../actions/ratesActions';
import { WalletState, outpointToString } from './../reducers/walletReducer';
import {
  SET_ADDRESSES,
  UPDATE_UTXOS,
  updateUtxos,
  setUtxo,
  deleteUtxo,
  resetUtxos,
} from './../actions/walletActions';
import { takeLatest, call, put, select, delay, all } from 'redux-saga/effects';
import {
  AddressInterface,
  UtxoInterface,
  fetchAndUnblindUtxosGenerator,
} from 'ldk';
import { addErrorToast } from '../actions/toastActions';
import {
  getAddressesFromStorage,
  setAddressesInStorage,
} from '../../utils/storage/storage-helper';

function* persistAddresses({
  type,
  payload,
}: {
  type: string;
  payload: AddressInterface[];
}) {
  yield call(setAddressesInStorage, payload);
  yield delay(1000);
  yield put(updateUtxos());
}

function* updateUtxosState({ type }: { type: string }) {
  try {
    const [addresses, utxos, explorerURL]: [
      AddressInterface[],
      Record<string, UtxoInterface>,
      string
    ] = yield all([
      call(getAddressesFromStorage),
      select(({ wallet }: { wallet: WalletState }) => wallet.utxos),
      select(({ settings }) => settings.explorerUrl),
    ]);
    yield put(updateRates());
    yield call(fetchAndUpdateUtxos, addresses, utxos, explorerURL);
  } catch (error) {
    console.error(error);
    yield put(addErrorToast('An error occurs while trying to fetch UTXOs.'));
  }
}

export function* fetchAndUpdateUtxos(
  addresses: AddressInterface[],
  currentUtxos: Record<string, UtxoInterface>,
  explorerUrl: string
) {
  const newOutpoints: string[] = [];

  const utxoGen = fetchAndUnblindUtxosGenerator(
    addresses,
    explorerUrl,
    (utxo: UtxoInterface) => currentUtxos[outpointToString(utxo)] != undefined
  );
  const next = () => utxoGen.next();

  let it: IteratorResult<UtxoInterface, number> = yield call(next);

  // if done = true it means that we do not find any utxos
  if (it.done) {
    yield put(resetUtxos());
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
}

export function* walletWatcherSaga() {
  yield takeLatest(SET_ADDRESSES, persistAddresses);
  yield takeLatest(UPDATE_UTXOS, updateUtxosState);
}
