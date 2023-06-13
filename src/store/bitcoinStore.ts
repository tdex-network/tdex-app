import axios from 'axios';
import merge from 'lodash.merge';
import { NoClaimFoundError, PeginRestorationError } from 'src/utils/errors';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { BitcoinService, fetchBitcoinUtxos } from '../services/bitcoinService';
import { outpointToString, sleep } from '../utils/helpers';

import { storage } from './capacitorPersistentStorage';
import { useSettingsStore } from './settingsStore';
import { useToastStore } from './toastStore';
import { useWalletStore } from './walletStore';

export interface DepositPeginUtxo {
  txHash: Buffer;
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
  // Info added after successful claim
  claimTxId?: string;
}

type Outpoint = string;
export type DepositPeginUtxos = Record<Outpoint, DepositPeginUtxo>;

export interface Pegin {
  // Address generated on deposit screen
  depositAddress: {
    address: string;
    claimScript: string;
    derivationPath: string;
  };
  // Info added after utxo fetching
  depositUtxos?: DepositPeginUtxos;
}

type ClaimScript = string;
export type Pegins = Record<ClaimScript, Pegin>;

interface BitcoinState {
  currentBtcBlockHeight: number;
  pegins: Pegins;
  // Global state necessary for modal to be triggered by toast
  modalClaimPegin: { isOpen?: boolean; claimScriptToClaim?: string };
}

interface BitcoinActions {
  checkIfClaimablePeginUtxo: () => Promise<void>;
  fetchCurrentBtcBlockHeight: () => Promise<void>;
  fetchAndUpdateDepositPeginUtxos: () => Promise<void>;
  restorePeginsFromDepositAddress: (depositAddress: string) => Promise<void>;
  setDepositPeginUtxo: (utxo: DepositPeginUtxo, depositAddress: Pegin['depositAddress']) => void;
  setModalClaimPegin: (modalClaimPegins: { isOpen?: boolean; claimScriptToClaim?: string }) => void; // TODO: handle multiple pegins?
  upsertPegins: (pegins: Pegins) => void;
  resetBitcoinStore: () => void;
}

const initialState: BitcoinState = {
  currentBtcBlockHeight: 0,
  pegins: {},
  modalClaimPegin: { isOpen: false, claimScriptToClaim: undefined },
};

export const useBitcoinStore = create<BitcoinState & BitcoinActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        checkIfClaimablePeginUtxo: async () => {
          // Delay to make sure pegins are updated at startup
          await sleep(1500);
          const pegins = useBitcoinStore.getState().pegins;
          const toasts = useToastStore.getState().toasts;
          const addClaimPeginToast = useToastStore.getState().addClaimPeginToast;
          const removeToastByType = useToastStore.getState().removeToastByType;
          let hasClaimablePeginUtxo = false;
          for (const claimScript in pegins) {
            const pegin = pegins[claimScript];
            for (const outpoint in pegin?.depositUtxos) {
              const depositUtxo = pegin.depositUtxos[outpoint];
              if (depositUtxo.status.block_height) {
                const confirmations = get().currentBtcBlockHeight - depositUtxo.status.block_height + 1;
                // Check if pegin not already claimed and utxo is mature
                if (!depositUtxo.claimTxId && confirmations >= 102) {
                  hasClaimablePeginUtxo = true;
                }
              }
            }
          }
          if (hasClaimablePeginUtxo) {
            if (!toasts.some((t) => t.type === 'claim-pegin')) {
              addClaimPeginToast();
              // UGLY HACK ///
              // Modify part name of '.toast-button-claim' to target it
              // ion-toast::part(button) would select all buttons
              await sleep(100);
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
            removeToastByType('claim-pegin');
          }
        },
        fetchCurrentBtcBlockHeight: async () => {
          const explorerBitcoinAPI = useSettingsStore.getState().explorerBitcoinAPI;
          const currentBtcBlockHeight = (await axios.get(`${explorerBitcoinAPI}/blocks/tip/height`)).data;
          set({ currentBtcBlockHeight }, false, 'fetchCurrentBtcBlockHeight');
        },
        fetchAndUpdateDepositPeginUtxos: async () => {
          const pegins = get().pegins;
          const explorerBitcoinAPI = useSettingsStore.getState().explorerBitcoinAPI;
          const depositAddresses = Object.values(pegins).map((p) => p.depositAddress);
          if (!depositAddresses.length) return;
          let utxos: DepositPeginUtxo[];
          let utxoBtcUpdatedCount = 0;
          for (const claimScript in pegins) {
            utxos = await fetchBitcoinUtxos(pegins[claimScript].depositAddress.address, explorerBitcoinAPI);
            for (const utxo of utxos) {
              if (
                !pegins[claimScript].depositUtxos?.[outpointToString(utxo)] ||
                !pegins[claimScript].depositUtxos?.[outpointToString(utxo)].status.confirmed
              ) {
                utxoBtcUpdatedCount++;
                get().setDepositPeginUtxo(utxo, pegins[claimScript].depositAddress);
              }
            }
          }
          if (utxoBtcUpdatedCount > 0) console.debug(`${utxoBtcUpdatedCount} btc utxos updated`);
        },
        restorePeginsFromDepositAddress: async (depositAddress) => {
          const addErrorToast = useToastStore.getState().addErrorToast;
          try {
            const scriptDetails = Object.values(useWalletStore.getState().scriptDetails);
            const pegins = useBitcoinStore.getState().pegins;
            const upsertPegins = useBitcoinStore.getState().upsertPegins;
            const fetchAndUpdateDepositPeginUtxos = useBitcoinStore.getState().fetchAndUpdateDepositPeginUtxos;
            const network = useSettingsStore.getState().network;
            const peginModule = await BitcoinService.getPeginModule(network);
            const retrievedPegins: Pegins = {};
            // Search match
            for (const s of scriptDetails) {
              const peginAddress = await peginModule.getMainchainAddress(s.script);
              if (depositAddress === peginAddress) {
                retrievedPegins[s.script] = {
                  depositAddress: {
                    address: peginAddress,
                    claimScript: s.script,
                    derivationPath: s.derivationPath ?? '',
                  },
                };
              }
            }
            if (!Object.keys(retrievedPegins).length) {
              addErrorToast(NoClaimFoundError);
              return;
            }
            // Merge with eventual state
            const newPegins = Object.assign({}, pegins, retrievedPegins);
            upsertPegins(newPegins);
            fetchAndUpdateDepositPeginUtxos();
          } catch (err) {
            console.error(err);
            addErrorToast(PeginRestorationError);
          }
        },
        setDepositPeginUtxo: (utxo: DepositPeginUtxo, depositAddress: Pegin['depositAddress']) => {
          set(
            (state) => {
              state.pegins[depositAddress.claimScript].depositUtxos = {
                ...state.pegins[depositAddress.claimScript].depositUtxos,
                [outpointToString(utxo)]: utxo,
              };
              return { pegins: state.pegins };
            },
            false,
            'setDepositPeginUtxo'
          );
        },
        setModalClaimPegin: (modalClaimPegin) => set({ modalClaimPegin }, false, 'setModalClaimPegin'),
        upsertPegins: (pegins) => {
          set(
            (state) => {
              return { pegins: merge({ ...pegins }, state.pegins) };
            },
            false,
            'upsertPegins'
          );
        },
        resetBitcoinStore: () => set(initialState, false, 'resetBitcoinStore'),
      }),
      {
        name: 'bitcoin',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'bitcoin' }
  )
);
