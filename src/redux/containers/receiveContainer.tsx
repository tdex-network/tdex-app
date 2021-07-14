import { IdentityType } from 'ldk';
import { connect } from 'react-redux';

import Receive from '../../pages/Receive';
import { network } from '../config';
import { lastUsedIndexesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any) => {
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
