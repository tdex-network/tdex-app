import { WalletState } from './../reducers/walletReducer';
import {
  BlindingKeyGetter,
  TxInterface,
  fetchAndUnblindTxsGenerator,
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
import { addAsset } from '../actions/assetsActions';
import moment from 'moment';

function* updateTransactions({ type }: { type: string }) {
  try {
    const [addresses, explorerURL, currentTxs]: [
      Record<string, AddressInterface>,
      string,
      Record<string, TxInterface>
    ] = yield all([
      select(({ wallet }: { wallet: WalletState }) => wallet.addresses),
      select(({ settings }) => settings.explorerUrl),
      select(({ transactions }) => transactions.txs),
    ]);

    const toSearch: string[] = [];
    for (const { confidentialAddress } of Object.values(addresses)) {
      toSearch.unshift(confidentialAddress);
    }

    yield call(fetchAndUpdateTxs, toSearch, addresses, currentTxs, explorerURL);
  } catch (e) {
    console.error(e);
    yield put(
      addErrorToast('An error occurs while trying to fetch transactions.')
    );
  }
}

/**
 * Saga launched in order to update the transactions state
 * @param addresses a set of addresses to search transactions.
 * @param scriptsToAddressInterface a record using to build a BlindingKeyGetter.
 * @param explorerUrl esplora URL used to fetch transactions.
 */
export function* fetchAndUpdateTxs(
  addresses: string[],
  scriptsToAddressInterface: Record<string, AddressInterface>,
  currentTxs: Record<string, TxInterface>,
  explorerUrl: string
) {
  const identityBlindKeyGetter: BlindingKeyGetter = (script: string) => {
    try {
      return scriptsToAddressInterface[script]?.blindingPrivateKey;
    } catch (_) {
      return undefined;
    }
  };
  const yesterday = moment().subtract(1, 'days');
  const txsGen = fetchAndUnblindTxsGenerator(
    addresses,
    identityBlindKeyGetter,
    explorerUrl,
    (tx: TxInterface) =>
      currentTxs[tx.txid] &&
      moment((tx.status.blockTime || 0) * 1000).isAfter(yesterday)
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
