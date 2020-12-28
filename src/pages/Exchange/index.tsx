import React, { useState, useEffect, useCallback } from 'react';
import { RouteComponentProps } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  swapAssets,
  resetTrade,
} from '../../redux/actions/exchange/tradeActions';
import { executeTrade } from '../../redux/actions/exchange/providerActions';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';
import { IconSwap } from '../../components/icons';
import ExchangeRow from '../../components/ExchangeRow';
import ExchangeSearch from '../../components/ExchangeSearch';
import classNames from 'classnames';
import './style.scss';

const Exchange: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();

  const { market, sendAmount, receiveAmount, completed } = useSelector(
    (state: any) => ({
      market: state.exchange.trade.market,
      sendAmount: state.exchange.trade.sendAmount,
      receiveAmount: state.exchange.trade.receiveAmount,
      completed: state.exchange.trade.completed,
    })
  );

  const [tradable, setTradable] = useState(false);

  useEffect(() => {
    setTradable(sendAmount > 0 && receiveAmount > 0);
  }, [sendAmount, receiveAmount]);

  useEffect(() => {
    if (completed) {
      dispatch(resetTrade());
      history.push('/tradeSummary');
    }
  }, [completed]);

  const swap = useCallback(() => {
    dispatch(swapAssets());
  }, []);

  const trade = useCallback(() => {
    dispatch(executeTrade());
  }, []);

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="exchange-header">
        <IonToolbar>
          <IonTitle>Exchange</IonTitle>
        </IonToolbar>
      </IonHeader>
      {market && (
        <IonContent className="exchange-content">
          <div className="exchange">
            <div className="exchange-divider">
              <IconSwap onClick={swap} />
            </div>
            <ExchangeRow party="send" />
            <ExchangeRow party="receive" />
          </div>
          <div className="buttons">
            <IonButton
              className={classNames('main-button', {
                secondary: !tradable,
              })}
              onClick={trade}
              disabled={!tradable}
            >
              Confirm
            </IonButton>
          </div>
          <ExchangeSearch />
        </IonContent>
      )}
    </IonPage>
  );
};

export default Exchange;
