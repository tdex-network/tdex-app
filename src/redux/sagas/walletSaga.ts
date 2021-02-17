import { getIdentity, waitForRestore } from './../services/walletService';
import { WalletState } from './../reducers/walletReducer';
import {
  SET_ADDRESSES,
  UPDATE_UTXOS,
  updateUtxos,
  setUtxo,
  deleteUtxo,
} from './../actions/walletActions';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import {
  AddressInterface,
  Outpoint,
  UtxoInterface,
  Mnemonic,
  fetchAndUnblindUtxosGenerator,
} from 'ldk';
import { storageAddresses } from '../../utils/storage-helper';
import { network } from '../config';

function* persistAddresses({
  type,
  payload,
}: {
  type: string;
  payload: AddressInterface[];
}) {
  yield call(storageAddresses, payload);
  yield put(updateUtxos());
}

function* updateUtxosState({ type }: { type: string }) {
  try {
    const actualUtxos: Map<Outpoint, UtxoInterface> = yield select(
      ({ wallet }: { wallet: WalletState }) => wallet.utxos
    );
    const newOutpoints: Outpoint[] = [];

    const identity: Mnemonic = yield call(getIdentity);
    yield call(waitForRestore, identity);

    const utxoGen = fetchAndUnblindUtxosGenerator(
      identity.getAddresses(),
      network.explorer
    );
    const next = () => utxoGen.next();

    let it: IteratorResult<UtxoInterface, number> = yield call(next);
    while (!it.done) {
      const utxo = it.value;
      newOutpoints.push({ txid: utxo.txid, vout: utxo.vout });

      if (!actualUtxos.has(utxo)) {
        yield put(setUtxo(utxo));
        console.log(utxo);
      }
      it = yield call(next);
    }

    const outpointsInStateIterator = actualUtxos.keys();
    let outpointIt: IteratorResult<
      Outpoint,
      any
    > = outpointsInStateIterator.next();
    while (!outpointIt.done) {
      const outpoint = outpointIt.value;
      if (!newOutpoints.includes(outpoint)) {
        yield put(deleteUtxo(outpoint));
      }
      outpointIt = outpointsInStateIterator.next();
    }
  } catch (error) {
    console.error(error);
  }
}

export function* walletWatcherSaga() {
  yield takeLatest(SET_ADDRESSES, persistAddresses);
  yield takeLatest(UPDATE_UTXOS, updateUtxosState);
  // yield takeLatest(GET_WALLET_ASSETS, getAssetSaga);
}
