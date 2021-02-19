import {
  BlindingKeyGetter,
  Mnemonic,
  TxInterface,
  fetchAndUnblindTxsGenerator,
} from 'ldk';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import { getIdentity, waitForRestore } from '../services/walletService';
import {
  setTransaction,
  UPDATE_TRANSACTIONS,
} from '../actions/transactionsActions';

function* updateTransactions({ type }: { type: string }) {
  try {
    const actualTxs: Record<string, TxInterface> = yield select(
      ({ transactions }) => transactions.txs
    );
    const explorerUrl = yield select(({ settings }) => settings.explorerUrl);

    const identity: Mnemonic = yield call(getIdentity);
    yield call(waitForRestore, identity);
    const blindPrivKeys = identity
      .getAddresses()
      .map((a) => a.blindingPrivateKey);

    const identityBlindKeyGetter: BlindingKeyGetter = (script: string) => {
      try {
        const k = identity.getBlindingPrivateKey(script);
        if (blindPrivKeys.includes(k)) return k;
        return undefined;
      } catch (_) {
        return undefined;
      }
    };

    const addresses = identity.getAddresses().map((a) => a.confidentialAddress);
    const txsGen = fetchAndUnblindTxsGenerator(
      addresses,
      identityBlindKeyGetter,
      explorerUrl,
      (tx) => actualTxs[tx.txid] != undefined
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
  } catch (e) {
    console.error(e);
  }
}

export function* transactionsWatcherSaga() {
  yield takeLatest(UPDATE_TRANSACTIONS, updateTransactions);
}
