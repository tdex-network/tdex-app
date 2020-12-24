import React, { useEffect } from 'react';
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
import './style.scss';

const Exchange: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();

  const { providerMarkets, tradable, completed } = useSelector(
    (state: any) => ({
      providerMarkets: state.exchange.provider.markets,
      tradable: state.exchange.trade.tradable,
      completed: state.exchange.trade.completed,
    })
  );

  function swap() {
    dispatch(swapAssets());
  }

  function trade() {
    dispatch(executeTrade());
  }

  useEffect(() => {
    if (completed) {
      dispatch(resetTrade());
      history.push('/tradeSummary');
    }
  }, [completed]);

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="exchange-header">
        <IonToolbar>
          <IonTitle>Exchange</IonTitle>
        </IonToolbar>
      </IonHeader>
      {providerMarkets.length && (
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
              className="main-button"
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
