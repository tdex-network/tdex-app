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
import { getAddresses, storageAddresses } from '../../utils/storage-helper';
import { addErrorToast } from '../actions/toastActions';

function* persistAddresses({
  type,
  payload,
}: {
  type: string;
  payload: AddressInterface[];
}) {
  yield call(storageAddresses, payload);
  yield delay(3000);
  yield put(updateUtxos());
}

function* updateUtxosState({ type }: { type: string }) {
  try {
    const [addresses, utxos, explorerURL]: [
      AddressInterface[],
      Record<string, UtxoInterface>,
      string
    ] = yield all([
      call(getAddresses),
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

  while (!it.done) {
    const utxo = it.value;
    newOutpoints.push(outpointToString(utxo));
    if (!currentUtxos[outpointToString(utxo)]) {
      yield put(setUtxo(utxo));
    }
    it = yield call(next);
  }

  // delete spent utxos
  for (const outpoint of Object.keys(currentUtxos)) {
    if (outpoint && !newOutpoints.includes(outpoint)) {
      const [txid, vout] = outpoint.split(':');
      yield put(deleteUtxo({ txid, vout: parseInt(vout) }));
    }
  }
}

export function* walletWatcherSaga() {
  yield takeLatest(SET_ADDRESSES, persistAddresses);
  yield takeLatest(UPDATE_UTXOS, updateUtxosState);
}
