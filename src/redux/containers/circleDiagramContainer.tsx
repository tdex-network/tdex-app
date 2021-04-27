import { connect } from 'react-redux';
import CircleDiagram, {
  CircleDiagramProps,
} from '../../components/CircleDiagram';
import { BalanceInterface } from '../actionTypes/walletActionTypes';
import { balancesSelector } from '../reducers/walletReducer';

const mapStateToProps = (state: any): CircleDiagramProps => {
  return {
    balances: balancesSelector(state)
      .filter((b) => b.amount > 0 && b.coinGeckoID)
      .map((balance: BalanceInterface) => {
        const price: number | undefined =
          state.rates.diagramPrices[balance.coinGeckoID || ''];
        return {
          asset: balance.asset,
          ticker: balance.ticker,
          amount: (price || 1) * balance.amount,
        };
      }),
  };
};

export default connect(mapStateToProps)(CircleDiagram);
