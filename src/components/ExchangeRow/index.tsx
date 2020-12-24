import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import {
  setSendAmount,
  setReceiveAmount,
  estimateSendAmount,
  estimateReceiveAmount,
} from '../../redux/actions/exchange/tradeActions';
import { showSearch } from '../../redux/actions/exchange/searchActions';
import { CurrencyIcon } from '../icons';
import { formatAmount, fromSatoshi } from '../../utils/helpers';
import './style.scss';

interface ExchangeRowInterface {
  className?: string;
  party?: any;
}

const ExchangeRow: React.FC<ExchangeRowInterface> = ({ className, party }) => {
  const dispatch = useDispatch();

  const {
    providerAssets,
    walletAssets,
    sendAsset,
    sendAmount,
    receiveAsset,
    receiveAmount,
  } = useSelector((state: any) => ({
    providerAssets: state.exchange.provider.assets,
    walletAssets: state.wallet.assets,
    sendAsset: state.exchange.trade.sendAsset,
    sendAmount: state.exchange.trade.sendAmount,
    receiveAsset: state.exchange.trade.receiveAsset,
    receiveAmount: state.exchange.trade.receiveAmount,
  }));

  const assetId = party === 'send' ? sendAsset : receiveAsset;
  const amount = party === 'send' ? sendAmount : receiveAmount;
  const selectedAsset = providerAssets.find((x: any) => x.id === assetId);
  const inputRef: any = useRef(null);
  const [asset, setAsset] = useState<any>();
  const [inputValue, setInputValue] = useState<any>(0);
  const [focusedInput, setFocusedInput] = useState<any>(false);

  useEffect(() => {
    if (selectedAsset && walletAssets) {
      const balance = formatAmount(
        fromSatoshi(
          walletAssets.find((x: any) => x.asset_id === assetId)?.amount || 0
        )
      );
      setAsset({
        ticker: selectedAsset.ticker,
        balance,
        amount,
        priceEquivalent: 10,
      });
    }
  }, [selectedAsset, walletAssets, sendAmount, receiveAmount]);

  function estimateAmount() {
    const estimateAmountAction =
      party === 'send' ? estimateReceiveAmount() : estimateSendAmount();

    dispatch(estimateAmountAction);
  }

  function displayedAmount() {
    return focusedInput ? inputValue : formatAmount(asset.amount);
  }

  function onClick() {
    inputRef.current.focus();
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const floatAmount = parseFloat(e.target.value) || 0;

    e.target.value = e.target.value
      .replace(/^0+\./, '0.')
      .replace(/^0+(\d)/, '$1');

    setInputValue(e.target.value);

    if (/^\d{1,8}(\.\d{0,8})?$/.test(floatAmount.toString())) {
      const setAmountAction =
        party === 'send' ? setSendAmount : setReceiveAmount;

      dispatch(setAmountAction(floatAmount));
    }
  }

  function onFocus(e: any) {
    e.target.value = parseFloat(e.target.value);
    setInputValue(e.target.value);
    setFocusedInput(true);
  }

  function onBlur() {
    setFocusedInput(false);
    estimateAmount();
  }

  return (
    <div className={classNames('exchange-coin-container', className)}>
      {asset?.ticker != undefined && (
        <div className="exchanger-row">
          <div
            className="coin-name"
            onClick={() => dispatch(showSearch(party))}
          >
            <span className="icon-wrapper medium">
              <CurrencyIcon currency={asset.ticker || 'undefined'} />
            </span>
            <p>{asset.ticker}</p>
          </div>
          <div
            className={classNames('coin-amount', {
              active: focusedInput || asset.amount > 0,
            })}
            onClick={onClick}
          >
            <p>{displayedAmount()}</p>
            <input
              inputMode="decimal"
              type="number"
              ref={inputRef}
              value={amount}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>
      )}
      {asset?.ticker != undefined && (
        <div className="exchanger-row sub-row">
          <div>
            <p>{`Total balance: ${asset.balance} ${asset.ticker}`}</p>
          </div>
          <div>
            <p>
              1 {asset.ticker} = {asset.priceEquivalent} EUR
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeRow;
