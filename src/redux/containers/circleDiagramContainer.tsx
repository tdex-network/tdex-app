import { connect } from 'react-redux';

import type { CircleDiagramProps } from '../../components/CircleDiagram';
import CircleDiagram from '../../components/CircleDiagram';
import type { BalanceInterface } from '../actionTypes/walletActionTypes';
import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any): CircleDiagramProps => {
  return {
    balances: balancesSelector(state)
      .filter((b) => b.amount > 0 && b.coinGeckoID)
      .map((balance: BalanceInterface) => {
        const price: number | undefined = state.rates.lbtcPrices[balance.coinGeckoID || ''];
        return {
          asset: balance.asset,
          ticker: balance.ticker,
          amount: (price || 1) * balance.amount,
        };
      }),
  };
};

export default connect(mapStateToProps)(CircleDiagram);
