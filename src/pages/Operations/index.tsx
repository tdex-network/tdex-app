import {
  IonPage,
  IonButtons,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonListHeader,
  IonIcon,
} from '@ionic/react';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import classNames from 'classnames';
import { checkmarkOutline } from 'ionicons/icons';
import { IconBack, IconBTC } from '../../components/icons';
import './style.scss';

const Operations: React.FC<RouteComponentProps> = ({ history }) => {
  const renderStatus: any = (status: string) => {
    return status === 'pending' ? (
      <div className="status pending">
        PENDING{' '}
        <span className="three-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </span>
      </div>
    ) : (
      <div className="status confirmed">
        STATUS <IonIcon color="success" icon={checkmarkOutline}></IonIcon>
      </div>
    );
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="header operations">
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>BTC BITCOIN</IonTitle>
        </IonToolbar>
        <div className="header-info">
          <div className="img-wrapper">
            <IconBTC width="48px" height="48px"></IconBTC>
          </div>
          <p className="info-amount">
            10,00 <span>BTC</span>
          </p>
          <p className="info-amount-converted">114,000,80 EUR</p>
        </div>
        <IonButtons className="operations-buttons">
          <IonButton className="coin-action-button" routerLink="/recieve">
            Recieve
          </IonButton>
          <IonButton className="coin-action-button" routerLink="/withdraw">
            Withdraw
          </IonButton>
          <IonButton className="coin-action-button" routerLink="/swap">
            Swap
          </IonButton>
        </IonButtons>
      </IonHeader>
      <IonContent className="operations">
        <IonList>
          <IonListHeader>Transactions</IonListHeader>
          <IonItem className="list-item">
            <div className="info-wrapper">
              <div className="item-main-info">
                <div className="item-start">
                  <div className="swap-images">
                    <span className="icon-wrapper">
                      <IconBTC width="13px" height="13px"></IconBTC>
                    </span>
                    <span className="icon-wrapper with-border">
                      <IconBTC width="13px" height="13px"></IconBTC>
                    </span>
                  </div>
                  <div className="item-name">
                    <div className="main-row">BTC / USDT</div>
                    <div className="sub-row">12 Sep 2020</div>
                  </div>
                </div>
                <div className="item-end">
                  <div className="first-col">
                    <div className="main-row">3,00</div>
                    <div className="sub-row">24,00</div>
                  </div>
                  <div className="second-col">
                    <div className="main-row accent">BTC</div>
                    <div className="sub-row">EUR</div>
                  </div>
                </div>
              </div>
            </div>
          </IonItem>
          <IonItem
            className={classNames('list-item transaction-item', {
              pending: true,
            })}
            onClick={() => {
              history.push('/operations');
            }}
          >
            <div className="info-wrapper">
              <div className="item-main-info">
                <div className="item-start">
                  <div className="swap-images">
                    <span className="icon-wrapper">
                      <IconBTC width="13px" height="13px"></IconBTC>
                    </span>
                    <span className="icon-wrapper with-border">
                      <IconBTC width="13px" height="13px"></IconBTC>
                    </span>
                  </div>
                  <div className="item-name">
                    <div className="main-row">BTC / USDT</div>
                    <div className="sub-row">12 Sep 2020</div>
                  </div>
                </div>
                <div className="item-end">
                  <div className="amount">
                    <div className="main-row">+3.001,00 </div>
                    <div className="main-row accent">USDT</div>
                  </div>
                  {renderStatus('confirmed')}
                </div>
              </div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Operations);
