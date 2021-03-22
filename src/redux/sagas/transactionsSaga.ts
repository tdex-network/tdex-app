import {
  BlindingKeyGetter,
  TxInterface,
  fetchAndUnblindTxsGenerator,
  address,
  AddressInterface,
  isBlindedOutputInterface,
} from 'ldk';
import {
  takeLatest,
  call,
  put,
  select,
  all,
  takeEvery,
} from 'redux-saga/effects';
import {
  setTransaction,
  SET_TRANSACTION,
  UPDATE_TRANSACTIONS,
} from '../actions/transactionsActions';
import { addErrorToast } from '../actions/toastActions';
import { getAddressesFromStorage } from '../../utils/storage-helper';
import { addAsset } from '../actions/assetsActions';

function* updateTransactions({ type }: { type: string }) {
  try {
    const [addresses, txs, explorerURL]: [
      AddressInterface[],
      Record<string, TxInterface>,
      string
    ] = yield all([
      call(getAddressesFromStorage),
      select(({ transactions }) => transactions.txs),
      select(({ settings }) => settings.explorerUrl),
    ]);

    yield call(fetchAndUpdateTxs, addresses, txs, explorerURL);
  } catch (e) {
    console.error(e);
    yield put(
      addErrorToast('An error occurs while trying to fetch transactions.')
    );
  }
}

/**
 * Saga launched in order to update the transactions state
 * @param addressesInterfaces
 * @param currentTxs
 * @param explorerUrl
 */
export function* fetchAndUpdateTxs(
  addressesInterfaces: AddressInterface[],
  currentTxs: Record<string, TxInterface>,
  explorerUrl: string
) {
  const addresses: string[] = [];
  const scriptToBlindingPrivKey: Record<string, string> = {};

  for (const addrI of addressesInterfaces) {
    addresses.push(addrI.confidentialAddress);
    if (addrI.blindingPrivateKey.length > 0) {
      const script = address
        .toOutputScript(addrI.confidentialAddress)
        .toString('hex');
      scriptToBlindingPrivKey[script] = addrI.blindingPrivateKey;
    }
  }

  const identityBlindKeyGetter: BlindingKeyGetter = (script: string) => {
    try {
      return scriptToBlindingPrivKey[script];
    } catch (_) {
      return undefined;
    }
  };

  const txsGen = fetchAndUnblindTxsGenerator(
    addresses,
    identityBlindKeyGetter,
    explorerUrl,
    (tx) =>
      currentTxs[tx.txid] != undefined && currentTxs[tx.txid].status.confirmed
  );
  const next = () => txsGen.next();
  let it: IteratorResult<TxInterface, number> = yield call(next);

  if (it.done) {
    return;
  }

  while (!it.done) {
    const tx = it.value;
    yield put(setTransaction(tx));
    it = yield call(next);
  }
}

// update the assets state when a new transaction is set in tx state
function* updateAssets({
  type,
  payload,
}: {
  type: string;
  payload: TxInterface;
}) {
  for (const out of payload.vout) {
    if (!isBlindedOutputInterface(out)) {
      yield put(addAsset(out.asset));
    }
  }
}

export function* transactionsWatcherSaga() {
  yield takeLatest(UPDATE_TRANSACTIONS, updateTransactions);
  yield takeEvery(SET_TRANSACTION, updateAssets);
}
