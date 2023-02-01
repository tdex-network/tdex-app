import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { storage } from './capacitorPersistentStorage';

interface AppState {
  isAppInitialized: boolean;
  isBackupDone: boolean;
  isFetchingUtxos: boolean;
  isFetchingMarkets: boolean;
  isFetchingTransactions: boolean;
  isSignedUp: boolean;
}

interface AppActions {
  setIsAppInitialized: (isAppInitialized: boolean) => void;
  setIsBackupDone: (isBackupDone: boolean) => void;
  setIsFetchingUtxos: (isFetchingUtxos: boolean) => void;
  setIsFetchingMarkets: (isFetchingMarkets: boolean) => void;
  setIsFetchingTransactions: (isFetchingTransactions: boolean) => void;
  setIsSignedUp: (isSignedUp: boolean) => void;
  resetApp: () => void;
}

const initialState: AppState = {
  isAppInitialized: false,
  isBackupDone: false,
  isFetchingUtxos: false,
  isFetchingMarkets: false,
  isFetchingTransactions: false,
  isSignedUp: false,
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setIsAppInitialized: (isAppInitialized) => set({ isAppInitialized }, false, 'setIsAppInitialized'),
        setIsBackupDone: (isBackupDone) => set({ isBackupDone }, false, 'setIsBackupDone'),
        setIsFetchingUtxos: (isFetchingUtxos) => set({ isFetchingUtxos }, false, 'setIsFetchingUtxos'),
        setIsFetchingMarkets: (isFetchingMarkets) => set({ isFetchingMarkets }, false, 'setIsFetchingMarkets'),
        setIsFetchingTransactions: (isFetchingTransactions) =>
          set({ isFetchingTransactions }, false, 'setIsFetchingTransactions'),
        setIsSignedUp: (isSignedUp) => set({ isSignedUp }, false, 'setIsSignedUp'),
        resetApp: () => set(initialState, false, 'resetApp'),
      }),
      {
        name: 'app',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'app' }
  )
);
