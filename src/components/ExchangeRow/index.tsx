import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  ChangeEvent,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import {
  setSendAmount,
  setReceiveAmount,
} from '../../redux/actions/exchange/tradeActions';
import { estimatePrice } from '../../redux/actions/exchange/providerActions';
import { showSearch } from '../../redux/actions/exchange/searchActions';
import { CurrencyIcon } from '../icons';
import { formatAmount, fromSatoshi } from '../../utils/helpers';
import './style.scss';

interface ExchangeRowInterface {
  party: string;
}

const ExchangeRow: React.FC<ExchangeRowInterface> = ({ party }) => {
  const AMOUNT_FORMAT = /^\d{1,6}(\.\d{0,8})?$/;
  const ESTIMATE_DELAY = 300;

  const dispatch = useDispatch();

  const {
    assets,
    walletAssets,
    sendAsset,
    receiveAsset,
    sendAmount,
    receiveAmount,
    rates,
  } = useSelector((state: any) => ({
    assets: state.assets,
    walletAssets: state.wallet.assets,
    sendAsset: state.exchange.trade.sendAsset,
    receiveAsset: state.exchange.trade.receiveAsset,
    sendAmount: state.exchange.trade.sendAmount,
    receiveAmount: state.exchange.trade.receiveAmount,
    rates: state.rates,
  }));

  const [asset, setAsset] = useState({
    ticker: '',
    name: '',
  });
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState(0);
  const [displayedAmount, setDisplayedAmount] = useState();
  const [priceEquivalent, setPriceEquivalent] = useState();
  const [amountInputValue, setAmountInputValue] = useState<any>('0');
  const [focused, setFocused] = useState(false);
  const [estimateTimer, setEstimateTimer] = useState<any>();

  const amountInputRef: any = useRef(null);

  useEffect(() => {
    const assetId = party == 'send' ? sendAsset : receiveAsset;
    setAsset(assets.byId[assetId]);

    setBalance(
      fromSatoshi(
        walletAssets?.find((x: any) => x.asset_id === assetId)?.amount || 0
      )
    );

    setAmount(party == 'send' ? sendAmount : receiveAmount);
    setPriceEquivalent(rates.byCurrency['eur']?.[asset.ticker.toLowerCase()]);
  }, [
    walletAssets,
    rates,
    assets,
    sendAmount,
    receiveAmount,
    sendAsset,
    receiveAsset,
  ]);

  useEffect(() => {
    setDisplayedAmount(focused ? amountInputValue : formatAmount(amount));
  }, [amount, amountInputValue, focused]);

  useEffect(() => {
    if (focused) {
      const timer = setTimeout(() => {
        const counterParty = party == 'send' ? 'receive' : 'send';
        dispatch(estimatePrice(counterParty));
      }, ESTIMATE_DELAY);

      clearTimeout(estimateTimer);
      setEstimateTimer(timer);
    }
  }, [focused, amount]);

  const onClick = useCallback(() => {
    amountInputRef.current.focus();
  }, []);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const filteredValue = event.target.value
        // empty amount
        .replace(/^$/, '0')
        // non-numeric charatcets
        .replace(/[^\d.]/, '')
        // leading zeros for decimal
        .replace(/^0+\./, '0.')
        // leading zeros for integer
        .replace(/^0+(\d)/, '$1')
        // multiple dots
        .replace(/(\..*)\./, '$1');

      setAmountInputValue(filteredValue);

      if (AMOUNT_FORMAT.test(filteredValue)) {
        const setAmountAction =
          party === 'send' ? setSendAmount : setReceiveAmount;

        dispatch(setAmountAction(parseFloat(filteredValue)));
      }
    },
    [party]
  );

  const onFocus = useCallback(() => {
    setAmountInputValue(amount);
    setFocused(true);
  }, []);

  const onBlur = useCallback(
    (event: any) => {
      setAmountInputValue(amount);
      setFocused(false);
    },
    [amount]
  );

  return (
    <div className="exchange-coin-container">
      <div className="exchanger-row">
        <div className="coin-name" onClick={() => dispatch(showSearch(party))}>
          <span className="icon-wrapper medium">
            <CurrencyIcon currency={asset.ticker || 'undefined'} />
          </span>
          <p>{asset.ticker}</p>
        </div>
        <div
          className={classNames('coin-amount', {
            active: focused || amount > 0,
          })}
          onClick={onClick}
        >
          <p>{displayedAmount}</p>
          <input
            inputMode="decimal"
            ref={amountInputRef}
            value={amountInputValue}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </div>
      <div className="exchanger-row sub-row">
        <div>
          <p>{`Total balance: ${balance} ${asset.ticker}`}</p>
        </div>
        {priceEquivalent && (
          <div>
            <p>
              1 {asset.ticker} = {priceEquivalent} EUR
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeRow;
