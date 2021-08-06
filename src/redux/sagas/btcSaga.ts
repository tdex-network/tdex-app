import axios from 'axios';
import type { AddressInterface, StateRestorerOpts } from 'ldk';
import { fetchUtxos, IdentityType, MasterPublicKey } from 'ldk';
import { address as addrLDK } from 'liquidjs-lib';
import type ElementsPegin from 'pegin';
import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects';
import type { Restorer } from 'tdex-sdk';
import { masterPubKeyRestorerFromState } from 'tdex-sdk';

import {
  NoClaimFoundError,
  PeginRestorationError,
  UpdateUtxosError,
} from '../../utils/errors';
import {
  getPeginsFromStorage,
  setPeginsInStorage,
} from '../../utils/storage-helper';
import type { ActionType } from '../../utils/types';
import { SIGN_IN } from '../actions/appActions';
import {
  setCurrentBtcBlockHeight,
  setDepositPeginUtxo,
  upsertPegins,
  RESTORE_PEGIN_FROM_DEPOSIT_ADDRESS,
  UPDATE_DEPOSIT_PEGIN_UTXOS,
  UPSERT_PEGINS,
  WATCH_CURRENT_BTC_BLOCK_HEIGHT,
} from '../actions/btcActions';
import { addErrorToast } from '../actions/toastActions';
import { addAddress } from '../actions/walletActions';
import { network } from '../config';
import type { BtcState, Pegins } from '../reducers/btcReducer';
import type { WalletState } from '../reducers/walletReducer';
import { outpointToString } from '../reducers/walletReducer';
import { getPeginModule } from '../services/btcService';

function* persistPegins() {
  yield delay(5_000);
  const pegins: Pegins = yield select(state => state.btc.pegins);
  yield call(setPeginsInStorage, pegins);
}

function* restorePegins() {
  const pegins: Pegins = yield call(getPeginsFromStorage);
  yield put(upsertPegins(pegins));
}

// Fetch block height continuously every minute
function* watchCurrentBtcBlockHeight() {
  const explorerBitcoinUrl: string = yield select(
    (state: any) => state.settings.explorerBitcoinUrl,
  );
  const { currentBlockHeight } = yield call(
    getCurrentBtcBlockHeight,
    explorerBitcoinUrl,
  );
  const setCurrentBtcBlockHeightAction =
    setCurrentBtcBlockHeight(currentBlockHeight);
  yield put(setCurrentBtcBlockHeightAction);
  yield delay(60_000);
  yield put({ type: 'WATCH_CURRENT_BTC_BLOCK_HEIGHT' });
}

async function getCurrentBtcBlockHeight(
  explorerBitcoinURL: string,
): Promise<{ currentBlockHeight: number }> {
  let currentBlockHeight;
  try {
    currentBlockHeight = (
      await axios.get(`${explorerBitcoinURL}/blocks/tip/height`)
    ).data;
  } catch (err) {
    console.error(err);
  }
  return { currentBlockHeight };
}

function* updateDepositPeginUtxosState() {
  try {
    const [pegins, explorerBitcoinURL]: [Pegins, string] = yield all([
      select(({ btc }: { btc: BtcState }) => btc.pegins),
      select(({ settings }) => settings.explorerBitcoinUrl),
    ]);
    yield call(fetchAndUpdateDepositPeginUtxos, pegins, explorerBitcoinURL);
  } catch (error) {
    console.error(error);
    yield put(addErrorToast(UpdateUtxosError));
  }
}

export function* fetchAndUpdateDepositPeginUtxos(
  pegins: Pegins,
  explorerBitcoinUrl: string,
): any {
  const depositAddresses = Object.values(pegins).map(p => p.depositAddress);
  if (!depositAddresses.length) return;
  let utxos;
  let utxoBtcUpdatedCount = 0;
  for (const claimScript in pegins) {
    utxos = yield call(
      fetchUtxos,
      pegins[claimScript].depositAddress.address,
      explorerBitcoinUrl,
    );
    if (utxos.length === 0) continue;
    for (const utxo of utxos) {
      if (
        !pegins[claimScript].depositUtxos?.[outpointToString(utxo)] ||
        !pegins[claimScript].depositUtxos?.[outpointToString(utxo)].status
          .confirmed
      ) {
        utxoBtcUpdatedCount++;
        yield put(
          setDepositPeginUtxo(utxo, pegins[claimScript].depositAddress),
        );
      }
    }
  }
  if (utxoBtcUpdatedCount > 0) {
    console.debug(`${utxoBtcUpdatedCount} btc utxos updated`);
  }
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
    const [
      addresses,
      masterBlindKey,
      masterPubKey,
      lastUsedIndexes,
      explorerBitcoinURL,
    ]: [WalletState['addresses'], string, string, StateRestorerOpts, string] =
      yield all([
        select(({ wallet }: { wallet: WalletState }) => wallet.addresses),
        select(({ wallet }: { wallet: WalletState }) => wallet.masterBlindKey),
        select(({ wallet }: { wallet: WalletState }) => wallet.masterPubKey),
        select(({ wallet }: { wallet: WalletState }) => ({
          lastUsedExternalIndex: wallet.lastUsedExternalIndex,
          lastUsedInternalIndex: wallet.lastUsedInternalIndex,
        })),
        select(({ settings }) => settings.explorerBitcoinUrl),
      ]);
    const peginModule: ElementsPegin = yield call(getPeginModule);
    const pegins: Pegins = {};
    const addrs = Object.entries(addresses).reverse();
    // Search extra 5 addresses
    // Needed if last action of user before losing wallet data was to generate addresses that received btc funds but not Liquid assets.
    // Those addresses are not restored by LDK
    const masterPublicKey: MasterPublicKey = new MasterPublicKey({
      chain: network.chain,
      type: IdentityType.MasterPublicKey,
      opts: {
        masterBlindingKey: masterBlindKey,
        masterPublicKey: masterPubKey,
      },
    });
    const restoredMasterPubKeyFn: Restorer<StateRestorerOpts, MasterPublicKey> =
      yield call(masterPubKeyRestorerFromState, masterPublicKey);
    const restoredMasterPubKey: MasterPublicKey = yield call(
      restoredMasterPubKeyFn,
      lastUsedIndexes,
    );
    for (let i = 0; i < 5; i++) {
      const addr: AddressInterface = yield call(() =>
        restoredMasterPubKey.getNextAddress(),
      );
      addrs.push([
        addrLDK.toOutputScript(addr.confidentialAddress).toString('hex'),
        addr,
      ]);
    }
    // Search match
    for (const [claimScript, addr] of addrs) {
      const peginAddress: string = yield call(() =>
        peginModule.getMainchainAddress(claimScript),
      );
      if (action.payload.depositAddress === peginAddress) {
        pegins[claimScript] = {
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
    if (!Object.keys(pegins).length) {
      yield put(addErrorToast(NoClaimFoundError));
      return;
    }
    // Update pegin state
    yield put(upsertPegins(pegins));
    yield call(fetchAndUpdateDepositPeginUtxos, pegins, explorerBitcoinURL);
    yield call(persistPegins);
  } catch (err) {
    console.error(err);
    yield put(addErrorToast(PeginRestorationError));
  }
}

export function* btcWatcherSaga(): Generator {
  yield takeLatest(SIGN_IN, restorePegins);
  yield takeLatest(UPDATE_DEPOSIT_PEGIN_UTXOS, updateDepositPeginUtxosState);
  yield takeLatest(UPDATE_DEPOSIT_PEGIN_UTXOS, persistPegins);
  yield takeLatest(WATCH_CURRENT_BTC_BLOCK_HEIGHT, watchCurrentBtcBlockHeight);
  yield takeLatest(UPSERT_PEGINS, persistPegins);
  yield takeLatest(
    RESTORE_PEGIN_FROM_DEPOSIT_ADDRESS,
    restorePeginsFromDepositAddress,
  );
}
