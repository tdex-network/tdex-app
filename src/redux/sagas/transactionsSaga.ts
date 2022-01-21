import type { BlindingKeyGetter, TxInterface, AddressInterface } from 'ldk';
import { fetchAndUnblindTxsGenerator, isBlindedOutputInterface, fetchTx, unblindTransaction } from 'ldk';
import { takeLatest, call, put, select, takeEvery, retry, delay } from 'redux-saga/effects';

import { UpdateTransactionsError } from '../../utils/errors';
import {
  clearTransactionsInStorage,
  getTransactionsFromStorage,
  setTransactionsInStorage,
} from '../../utils/storage-helper';
import { setIsFetchingTransactions } from '../actions/appActions';
import { addAsset } from '../actions/assetsActions';
import { addErrorToast } from '../actions/toastActions';
import {
  addWatcherTransaction,
  removeWatcherTransaction,
  setTransaction,
  SET_TRANSACTION,
  UPDATE_TRANSACTIONS,
  WATCH_TRANSACTION,
  RESET_TRANSACTION_REDUCER,
  watchTransaction,
} from '../actions/transactionsActions';
import type { WalletState } from '../reducers/walletReducer';
import type { RootState, SagaGenerator } from '../types';

export function* restoreTransactions(): SagaGenerator<void, TxInterface[]> {
  const txs = yield call(getTransactionsFromStorage);
  for (const tx of txs) {
    yield put(setTransaction(tx));
  }
}

function* persistTransactions() {
  const txs: TxInterface[] = yield select(({ transactions }) => Object.values(transactions.txs));
  yield call(setTransactionsInStorage, txs);
}

function* updateTransactions() {
  try {
    const {
      addresses,
      explorerLiquidAPI,
      currentTxs,
    }: {
      addresses: Record<string, AddressInterface>;
      explorerLiquidAPI: string;
      currentTxs: Record<string, TxInterface>;
    } = yield select(({ wallet, settings, transactions }: RootState) => ({
      addresses: wallet.addresses,
      explorerLiquidAPI: settings.explorerLiquidAPI,
      currentTxs: transactions.txs,
    }));
    const toSearch: string[] = [];
    for (const { confidentialAddress } of Object.values(addresses)) {
      toSearch.unshift(confidentialAddress);
    }
    yield call(fetchAndUpdateTxs, toSearch, addresses, currentTxs, explorerLiquidAPI);
  } catch (e) {
    console.error(e);
    yield put(addErrorToast(UpdateTransactionsError));
  }
}

/**
 * Saga launched in order to update the transactions state
 * @param addresses a set of addresses to search transactions.
 * @param scriptsToAddressInterface a record using to build a BlindingKeyGetter.
 * @param currentTxs
 * @param explorerLiquidAPI esplora URL used to fetch transactions.
 */
export function* fetchAndUpdateTxs(
  addresses: string[],
  scriptsToAddressInterface: Record<string, AddressInterface>,
  currentTxs: Record<string, TxInterface>,
  explorerLiquidAPI: string
): Generator<any, any, any> {
  yield put(setIsFetchingTransactions(true));
  const identityBlindKeyGetter = blindKeyGetterFactory(scriptsToAddressInterface);

  const txsGen = fetchAndUnblindTxsGenerator(
    addresses,
    identityBlindKeyGetter,
    explorerLiquidAPI,
    (tx: TxInterface) => {
      const txInStore = currentTxs[tx.txid];
      // skip if tx is already in store AND confirmed
      return !!txInStore?.status.confirmed;
    }
  );
  const next = () => txsGen.next();
  let it: IteratorResult<TxInterface, number> = yield call(next);
  if (it.done) {
    yield put(setIsFetchingTransactions(false));
    return;
  }
  while (!it.done) {
    const tx = it.value;
    yield put(setTransaction(tx));
    it = yield call(next);
  }
}

// update the assets state when a new transaction is set in tx state
function* updateAssets({ payload }: ReturnType<typeof setTransaction>) {
  if (payload?.vout) {
    for (const out of payload.vout) {
      if (!isBlindedOutputInterface(out)) {
        yield put(addAsset(out.asset));
      }
    }
  }
}

function* watchTransactionSaga({ payload }: ReturnType<typeof watchTransaction>) {
  if (!payload) return;
  const { txID, maxTry } = payload;
  yield put(addWatcherTransaction(txID));
  const explorer: string = yield select(({ settings }) => settings.explorerLiquidAPI);
  try {
    const tx: TxInterface = yield retry(maxTry, 5000, fetchTx, txID, explorer);
    const scriptsToAddress: Record<string, AddressInterface> = yield select(
      ({ wallet }: { wallet: WalletState }) => wallet.addresses
    );
    const blindKeyGetter = blindKeyGetterFactory(scriptsToAddress);
    const { unblindedTx, errors } = yield call(unblindTransaction, tx, blindKeyGetter);
    if (errors.length > 0) {
      errors.forEach((err: { message?: string }) => {
        console.error(err.message);
      });
    }
    yield put(setTransaction(unblindedTx));
    // Refetch after one minute for status confirmation
    if (!unblindedTx?.status.confirmed) {
      yield put(removeWatcherTransaction(txID));
      yield delay(60 * 1000);
      yield put(watchTransaction(txID));
    }
    yield put(removeWatcherTransaction(txID));
  } catch (err) {
    console.error(err);
  }
  yield put(removeWatcherTransaction(txID));
}

function blindKeyGetterFactory(scriptsToAddressInterface: Record<string, AddressInterface>): BlindingKeyGetter {
  return (script: string) => {
    try {
      return scriptsToAddressInterface[script]?.blindingPrivateKey;
    } catch (_) {
      return undefined;
    }
  };
}

function* resetTransactions() {
  yield call(clearTransactionsInStorage);
}

export function* transactionsWatcherSaga(): SagaGenerator {
  yield takeLatest(UPDATE_TRANSACTIONS, function* () {
    yield* updateTransactions();
    yield* persistTransactions();
  });
  yield takeEvery(SET_TRANSACTION, updateAssets);
  yield takeEvery(WATCH_TRANSACTION, watchTransactionSaga);
  yield takeEvery(RESET_TRANSACTION_REDUCER, resetTransactions);
}
