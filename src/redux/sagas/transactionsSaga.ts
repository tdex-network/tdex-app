import {
  BlindingKeyGetter,
  TxInterface,
  fetchAndUnblindTxsGenerator,
  address,
  AddressInterface,
} from 'ldk';
import { takeLatest, call, put, select, all } from 'redux-saga/effects';
import {
  setTransaction,
  UPDATE_TRANSACTIONS,
} from '../actions/transactionsActions';
import { getAddresses } from '../../utils/storage-helper';
import { addErrorToast } from '../actions/toastActions';

function* updateTransactions({ type }: { type: string }) {
  try {
    const [addresses, txs, explorerURL]: [
      AddressInterface[],
      Record<string, TxInterface>,
      string
    ] = yield all([
      call(getAddresses),
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

export function* transactionsWatcherSaga() {
  yield takeLatest(UPDATE_TRANSACTIONS, updateTransactions);
}
