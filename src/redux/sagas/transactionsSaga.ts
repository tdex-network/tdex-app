import type { TxInterface, AddressInterface } from 'ldk';
import { fetchTx, isUnblindedOutput, unblindTransaction } from 'ldk';
import { takeLatest, call, put, select, takeEvery, retry, delay } from 'redux-saga/effects';
import type { EsploraTx } from 'tdex-sdk';
import { ElectrsBatchServer, getAsset, txsFetchGenerator } from 'tdex-sdk';

import { UpdateTransactionsError } from '../../utils/errors';
import { blindingKeyGetterFactory, splitArray } from '../../utils/helpers';
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

const MAX_ADDRESSES_TX_GENERATOR = 20;

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
      electrsBatchAPI,
      currentTxs,
    }: {
      addresses: Record<string, AddressInterface>;
      explorerLiquidAPI: string;
      electrsBatchAPI: string;
      currentTxs: Record<string, TxInterface>;
    } = yield select(({ wallet, settings, transactions }: RootState) => ({
      addresses: wallet.addresses,
      explorerLiquidAPI: settings.explorerLiquidAPI,
      electrsBatchAPI: settings.electrsBatchAPI,
      currentTxs: transactions.txs,
    }));
    const toSearch: string[] = [];
    for (const { confidentialAddress } of Object.values(addresses)) {
      toSearch.unshift(confidentialAddress);
    }
    if (toSearch.length > 0) {
      yield call(fetchAndUpdateTxs, toSearch, addresses, currentTxs, explorerLiquidAPI, electrsBatchAPI);
    }
  } catch (e) {
    console.error(e);
    yield put(addErrorToast(UpdateTransactionsError));
    yield put(setIsFetchingTransactions(false));
  }
}

/**
 * Saga launched in order to update the transactions state
 * @param addresses a set of addresses to search transactions.
 * @param scriptsToAddressInterface a record using to build a BlindingKeyGetter.
 * @param currentTxs
 * @param explorerLiquidAPI esplora URL used to fetch transactions.
 * @param electrsBatchAPI
 */
export function* fetchAndUpdateTxs(
  addresses: string[],
  scriptsToAddressInterface: Record<string, AddressInterface>,
  currentTxs: Record<string, TxInterface>,
  explorerLiquidAPI: string,
  electrsBatchAPI: string
): Generator<any, any, any> {
  yield put(setIsFetchingTransactions(true));
  const blindingKeyGetter = blindingKeyGetterFactory(scriptsToAddressInterface);
  const api = ElectrsBatchServer.fromURLs(electrsBatchAPI, explorerLiquidAPI);
  const splittedAddresses = splitArray(
    addresses.map((addr) => addr),
    MAX_ADDRESSES_TX_GENERATOR
  );
  const txsGens = splittedAddresses.reverse().map((addresses) =>
    txsFetchGenerator(
      addresses,
      async (script) => blindingKeyGetter(script),
      api,
      (tx: EsploraTx) => {
        const txInStore = currentTxs[tx.txid];
        // skip if tx is already in store AND confirmed
        return !!txInStore?.status.confirmed;
      }
    )
  );
  for (let txsGen of txsGens) {
    const next = () => txsGen.next();
    let it: IteratorResult<TxInterface, number> = yield call(next);
    while (!it.done) {
      const tx = it.value;
      yield put(setTransaction(tx));
      it = yield call(next);
    }
  }
  yield put(setIsFetchingTransactions(false));
}

// update the assets state when a new transaction is set in tx state
function* updateAssets({ payload }: ReturnType<typeof setTransaction>) {
  if (payload?.vout) {
    for (const out of payload.vout) {
      if (isUnblindedOutput(out)) {
        yield put(addAsset(getAsset(out)));
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
    const blindKeyGetter = blindingKeyGetterFactory(scriptsToAddress);
    const { unblindedTx, errors } = yield call(unblindTransaction, tx, async (script) => blindKeyGetter(script));
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
