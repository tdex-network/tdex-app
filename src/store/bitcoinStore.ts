import axios from 'axios';
import { merge } from 'lodash';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { outpointToString } from '../utils/helpers';

import { storage } from './capacitorPersistentStorage';
import { useSettingsStore } from './settingsStore';

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
  getCurrentBtcBlockHeight: () => Promise<void>;
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
      (set) => ({
        ...initialState,
        getCurrentBtcBlockHeight: async () => {
          const explorerBitcoinAPI = useSettingsStore.getState().explorerBitcoinAPI;
          const currentBtcBlockHeight = (await axios.get(`${explorerBitcoinAPI}/blocks/tip/height`)).data;
          set({ currentBtcBlockHeight }, false, 'getCurrentBtcBlockHeight');
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
