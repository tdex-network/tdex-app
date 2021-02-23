import { updateRates } from './../actions/ratesActions';
import { getIdentity, waitForRestore } from './../services/walletService';
import { WalletState, outpointToString } from './../reducers/walletReducer';
import {
  SET_ADDRESSES,
  UPDATE_UTXOS,
  updateUtxos,
  setUtxo,
  deleteUtxo,
  resetUtxos,
} from './../actions/walletActions';
import { takeLatest, call, put, select, delay } from 'redux-saga/effects';
import {
  AddressInterface,
  UtxoInterface,
  Mnemonic,
  fetchAndUnblindUtxosGenerator,
} from 'ldk';
import { storageAddresses } from '../../utils/storage-helper';

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
    // dispatch UPDATE_RATES to update prices async
    yield put(updateRates());

    const currentUtxos: Record<string, UtxoInterface> = yield select(
      ({ wallet }: { wallet: WalletState }) => wallet.utxos
    );
    const newOutpoints: string[] = [];

    const identity: Mnemonic = yield call(getIdentity);
    yield call(waitForRestore, identity);
    const explorerUrl = yield select(({ settings }) => settings.explorerUrl);

    const utxoGen = fetchAndUnblindUtxosGenerator(
      identity.getAddresses(),
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
      newOutpoints.push(outpointToString({ txid: utxo.txid, vout: utxo.vout }));
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
  } catch (error) {
    console.error(error);
  }
}

export function* walletWatcherSaga() {
  yield takeLatest(SET_ADDRESSES, persistAddresses);
  yield takeLatest(UPDATE_UTXOS, updateUtxosState);
}
