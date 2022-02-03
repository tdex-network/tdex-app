import axios from 'axios';
import type { AddressInterface, StateRestorerOpts } from 'ldk';
import { IdentityType, MasterPublicKey } from 'ldk';
import { address as addrLDK } from 'liquidjs-lib';
import type ElementsPegin from 'pegin';
import { all, call, delay, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import type { NetworkString, Restorer } from 'tdex-sdk';
import { masterPubKeyRestorerFromState } from 'tdex-sdk';

import { NoClaimFoundError, PeginRestorationError, UpdateUtxosError } from '../../utils/errors';
import { getPeginsFromStorage, setPeginsInStorage } from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import {
  setCurrentBtcBlockHeight,
  setDepositPeginUtxo,
  upsertPegins,
  RESTORE_PEGIN_FROM_DEPOSIT_ADDRESS,
  UPDATE_DEPOSIT_PEGIN_UTXOS,
  UPSERT_PEGINS,
  WATCH_CURRENT_BTC_BLOCK_HEIGHT,
  CHECK_IF_CLAIMABLE_PEGIN_UTXO,
} from '../actions/btcActions';
import { addErrorToast, addClaimPeginToast, removeToastByType } from '../actions/toastActions';
import { addAddress } from '../actions/walletActions';
import type { BtcState, Pegins } from '../reducers/btcReducer';
import type { ToastState } from '../reducers/toastReducer';
import type { WalletState } from '../reducers/walletReducer';
import { outpointToString } from '../reducers/walletReducer';
import { fetchBitcoinUtxos, getPeginModule } from '../services/btcService';
import type { RootState, SagaGenerator } from '../types';

export function* restorePegins(): SagaGenerator<void, Pegins> {
  const pegins = yield call(getPeginsFromStorage);
  yield put(upsertPegins(pegins));
}

function* persistPegins() {
  const pegins: Pegins = yield select((state: RootState) => state.btc.pegins);
  yield call(setPeginsInStorage, pegins);
}

// Fetch block height continuously every minute
function* watchCurrentBtcBlockHeight() {
  const explorerBitcoinAPI: string = yield select((state: RootState) => state.settings.explorerBitcoinAPI);
  const { currentBlockHeight } = yield call(getCurrentBtcBlockHeight, explorerBitcoinAPI);
  yield put(setCurrentBtcBlockHeight(currentBlockHeight));
  yield delay(60_000);
  yield put({ type: 'WATCH_CURRENT_BTC_BLOCK_HEIGHT' });
}

async function getCurrentBtcBlockHeight(explorerBitcoinAPI: string): Promise<{ currentBlockHeight: number }> {
  let currentBlockHeight;
  try {
    currentBlockHeight = (await axios.get(`${explorerBitcoinAPI}/blocks/tip/height`)).data;
  } catch (err) {
    console.error(err);
  }
  return { currentBlockHeight };
}

function* updateDepositPeginUtxosState() {
  try {
    const [pegins, explorerBitcoinAPI]: [Pegins, string] = yield all([
      select(({ btc }: { btc: BtcState }) => btc.pegins),
      select(({ settings }) => settings.explorerBitcoinAPI),
    ]);
    yield call(fetchAndUpdateDepositPeginUtxos, pegins, explorerBitcoinAPI);
  } catch (error) {
    console.error(error);
    yield put(addErrorToast(UpdateUtxosError));
  }
}

export function* fetchAndUpdateDepositPeginUtxos(pegins: Pegins, explorerBitcoinAPI: string): any {
  const depositAddresses = Object.values(pegins).map((p) => p.depositAddress);
  if (!depositAddresses.length) return;
  let utxos;
  let utxoBtcUpdatedCount = 0;
  for (const claimScript in pegins) {
    utxos = yield call(fetchBitcoinUtxos, pegins[claimScript].depositAddress.address, explorerBitcoinAPI);
    for (const utxo of utxos) {
      if (
        !pegins[claimScript].depositUtxos?.[outpointToString(utxo)] ||
        !pegins[claimScript].depositUtxos?.[outpointToString(utxo)].status.confirmed
      ) {
        utxoBtcUpdatedCount++;
        yield put(setDepositPeginUtxo(utxo, pegins[claimScript].depositAddress));
      }
    }
  }
  if (utxoBtcUpdatedCount > 0) console.debug(`${utxoBtcUpdatedCount} btc utxos updated`);
}

/**
 * Restore pegins
 * @description Used when wallet doesn't have storage data anymore. After deep restoration of Liquid addresses, search for Bitcoin
 * deposit address match and recreate pegin with associated data.
 * @param action
 * @returns pegins Pegins of provided depositAddressSearch
 */
function* restorePeginsFromDepositAddress(action: ActionType) {
  try {
    const [pegins, addresses, masterBlindKey, masterPubKey, lastUsedIndexes, explorerBitcoinAPI, network]: [
      Pegins,
      WalletState['addresses'],
      string,
      string,
      StateRestorerOpts,
      string,
      NetworkString
    ] = yield all([
      select(({ btc }: RootState) => btc.pegins),
      select(({ wallet }: RootState) => wallet.addresses),
      select(({ wallet }: RootState) => wallet.masterBlindKey),
      select(({ wallet }: RootState) => wallet.masterPubKey),
      select(({ wallet }: RootState) => ({
        lastUsedExternalIndex: wallet.lastUsedExternalIndex,
        lastUsedInternalIndex: wallet.lastUsedInternalIndex,
      })),
      select(({ settings }: RootState) => settings.explorerBitcoinAPI),
      select(({ settings }: RootState) => settings.network),
    ]);
    const peginModule: ElementsPegin = yield call(getPeginModule, network);
    const retrievedPegins: Pegins = {};
    const addrs = Object.entries(addresses).reverse();
    // Search extra 5 addresses
    // Needed if last action of user before losing wallet data was to generate addresses that received btc funds but not Liquid assets.
    // Those addresses are not restored by LDK
    const masterPublicKey: MasterPublicKey = new MasterPublicKey({
      chain: network,
      type: IdentityType.MasterPublicKey,
      opts: {
        masterBlindingKey: masterBlindKey,
        masterPublicKey: masterPubKey,
      },
    });
    const restoredMasterPubKeyFn: Restorer<StateRestorerOpts, MasterPublicKey> = yield call(
      masterPubKeyRestorerFromState,
      masterPublicKey
    );
    const restoredMasterPubKey: MasterPublicKey = yield call(restoredMasterPubKeyFn, lastUsedIndexes);
    for (let i = 0; i < 5; i++) {
      const addr: AddressInterface = yield call(() => restoredMasterPubKey.getNextAddress());
      addrs.push([addrLDK.toOutputScript(addr.confidentialAddress).toString('hex'), addr]);
    }
    // Search match
    for (const [claimScript, addr] of addrs) {
      const peginAddress: string = yield call(() => peginModule.getMainchainAddress(claimScript));
      if (action.payload.depositAddress === peginAddress) {
        retrievedPegins[claimScript] = {
          depositAddress: {
            address: peginAddress,
            claimScript: claimScript,
            derivationPath: addr.derivationPath ?? '',
          },
        };
        // Save used address in state so that the wallet can be aware of new LBTC deposits after claim
        yield put(addAddress(addr));
      }
    }
    if (!Object.keys(retrievedPegins).length) {
      yield put(addErrorToast(NoClaimFoundError));
      return;
    }
    // Merge with eventual state
    const newPegins = Object.assign({}, pegins, retrievedPegins);
    // Update pegin state
    yield put(upsertPegins(newPegins));
    yield call(fetchAndUpdateDepositPeginUtxos, newPegins, explorerBitcoinAPI);
  } catch (err) {
    console.error(err);
    yield put(addErrorToast(PeginRestorationError));
  }
}

function* checkIfClaimablePeginUtxo() {
  // Delay to make sure pegins are updated at startup
  yield delay(1500);
  let hasClaimablePeginUtxo = false;
  const [pegins, currentBlockHeight, toasts]: [Pegins, number, ToastState] = yield all([
    select(({ btc }: { btc: BtcState }) => btc.pegins),
    select(({ btc }: { btc: BtcState }) => btc.currentBlockHeight),
    select(({ toasts }: { toasts: ToastState }) => toasts),
  ]);
  for (const claimScript in pegins) {
    const pegin = pegins[claimScript];
    for (const outpoint in pegin?.depositUtxos) {
      const depositUtxo = pegin.depositUtxos[outpoint];
      if (depositUtxo.status.block_height) {
        const confirmations = currentBlockHeight - depositUtxo.status.block_height + 1;
        // Check if pegin not already claimed and utxo is mature
        if (!depositUtxo.claimTxId && confirmations >= 102) {
          hasClaimablePeginUtxo = true;
        }
      }
    }
  }
  if (hasClaimablePeginUtxo) {
    if (!toasts.some((t) => t.type === 'claim-pegin')) {
      yield put(addClaimPeginToast());
      // UGLY HACK ///
      // Modify part name of '.toast-button-claim' to target it
      // ion-toast::part(button) would select all buttons
      yield delay(100);
      const toastEl = document.querySelector('ion-toast');
      const el = toastEl?.shadowRoot && toastEl.shadowRoot.querySelector('.toast-button-claim');
      if (el) el.setAttribute('part', 'toast-button-claim');
      // target .toast-button-group-end
      const btnGroupEnd = toastEl?.shadowRoot && toastEl.shadowRoot.querySelector('.toast-button-group-end');
      if (btnGroupEnd) btnGroupEnd.setAttribute('part', 'toast-button-group-end');
      // target .toast-content
      const content = toastEl?.shadowRoot && toastEl.shadowRoot.querySelector('.toast-content');
      if (content) content.setAttribute('part', 'toast-content');
    }
  } else {
    yield put(removeToastByType('claim-pegin'));
  }
}

export function* btcWatcherSaga(): SagaGenerator {
  yield takeLatest(UPDATE_DEPOSIT_PEGIN_UTXOS, function* () {
    yield* updateDepositPeginUtxosState();
    yield* persistPegins();
  });
  yield takeLatest(WATCH_CURRENT_BTC_BLOCK_HEIGHT, watchCurrentBtcBlockHeight);
  yield takeLatest(UPSERT_PEGINS, persistPegins);
  yield takeLatest(RESTORE_PEGIN_FROM_DEPOSIT_ADDRESS, restorePeginsFromDepositAddress);
  yield takeLeading(CHECK_IF_CLAIMABLE_PEGIN_UTXO, checkIfClaimablePeginUtxo);
}
