import React from 'react';
import Wallet from '../src/pages/Wallet';
import { BalanceInterface } from '../src/redux/actionTypes/walletActionTypes';
import { ActionType } from '../src/utils/types';
import { fakePrices, render } from './test-utils';
import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';
import { fromSatoshiFixed, capitalizeFirstLetter } from '../src/utils/helpers';

const LBTCbalance = {
  amount: 1_0000_0000,
  asset: '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
  ticker: 'LBTC',
  coinGeckoID: 'bitcoin',
};

const ALTCOINbalance = {
  amount: 1_0000_0000,
  asset: 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
  ticker: 'zCOIN',
};

describe('wallet component', () => {
  test('should render the balances', () => {
    const balances: BalanceInterface[] = [LBTCbalance, ALTCOINbalance];
    const { getByLabelText } = render(
      <Wallet
        balances={balances}
        currency="eur"
        prices={fakePrices}
        dispatch={(_: ActionType) => null}
      />
    );

    expect(getByLabelText('main-balance')).toHaveTextContent('1.00LBTC');

    for (const balance of balances) {
      expect(getByLabelText(balance.ticker)).toBeInTheDocument();
      expect(getByLabelText(`${balance.ticker}-amount`)).toHaveTextContent(
        fromSatoshiFixed(balance.amount)
      );

      const assetElement = getByLabelText(`${balance.ticker}-asset`);
      if (balance.coinGeckoID) {
        expect(assetElement).toHaveTextContent(
          capitalizeFirstLetter(balance.coinGeckoID)
        );
      } else {
        expect(assetElement).toHaveTextContent(`Asset ${balance.ticker}`);
      }
    }
  });

  test('main balance should be 0.00 if there is no LBTC balance', () => {
    const { getByLabelText } = render(
      <Wallet
        balances={[ALTCOINbalance]}
        currency="eur"
        prices={fakePrices}
        dispatch={(_: ActionType) => null}
      />
    );

    expect(getByLabelText('main-balance')).toHaveTextContent('0.00LBTC');
  });
});
