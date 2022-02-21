import type { ComponentProps } from 'react';
import { connect } from 'react-redux';

import TradeRowInput from '../../components/TdexOrderInput/TradeRowInput';
import { balanceByAssetSelector } from '../reducers/walletReducer';
import type { RootState } from '../types';

const mapStateToProps = (state: RootState, ownProps: ComponentProps<any>) => {
  return {
    balance: ownProps.assetSelected ? balanceByAssetSelector(ownProps.assetSelected.assetHash)(state) : undefined,
    currency: state.settings.currency,
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
    price: ownProps.assetSelected?.coinGeckoID ? state.rates.prices[ownProps.assetSelected.coinGeckoID] : 0,
  };
};

export default connect(mapStateToProps)(TradeRowInput);
