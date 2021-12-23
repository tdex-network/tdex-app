import { IdentityType } from 'ldk';
import { connect } from 'react-redux';

import Receive from '../../pages/Receive';
import { lastUsedIndexesSelector } from '../reducers/walletReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState) => {
  return {
    lastUsedIndexes: lastUsedIndexesSelector(state),
    masterPubKeyOpts: {
      chain: state.settings.network,
      type: IdentityType.MasterPublicKey,
      opts: {
        masterBlindingKey: state.wallet.masterBlindKey,
        masterPublicKey: state.wallet.masterPubKey,
      },
    },
    network: state.settings.network,
  };
};

export default connect(mapStateToProps)(Receive);
