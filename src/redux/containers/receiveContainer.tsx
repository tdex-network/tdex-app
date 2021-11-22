import { IdentityType } from 'ldk';
import { connect } from 'react-redux';

import Receive from '../../pages/Receive';
import { network } from '../config';
import { lastUsedIndexesSelector } from '../reducers/walletReducer';
import type { RootState } from '../store';

const mapStateToProps = (state: RootState) => {
  return {
    lastUsedIndexes: lastUsedIndexesSelector(state),
    masterPubKeyOpts: {
      chain: network.chain,
      type: IdentityType.MasterPublicKey,
      opts: {
        masterBlindingKey: state.wallet.masterBlindKey,
        masterPublicKey: state.wallet.masterPubKey,
      },
    },
  };
};

export default connect(mapStateToProps)(Receive);
