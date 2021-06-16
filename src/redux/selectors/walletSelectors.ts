import type { StateRestorerOpts } from 'ldk';

import type { WalletState } from '../reducers/walletReducer';

export function lastUsedIndexesSelector({
  wallet,
}: {
  wallet: WalletState;
}): StateRestorerOpts {
  return {
    lastUsedInternalIndex: wallet.lastUsedInternalIndex,
    lastUsedExternalIndex: wallet.lastUsedExternalIndex,
  };
}
