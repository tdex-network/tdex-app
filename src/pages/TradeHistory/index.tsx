import {
  IonPage,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonListHeader,
  IonIcon,
  IonLabel,
  IonText,
} from '@ionic/react';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { IconBack, IconBTC } from '../../components/icons';
import classNames from 'classnames';
import { checkmarkOutline } from 'ionicons/icons';
import './style.scss';

const TradeHistory: React.FC<RouteComponentProps> = ({ history }) => {
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
        CONFIRMED <IonIcon color="success" icon={checkmarkOutline}></IonIcon>
      </div>
    );
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="">
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>Trade history</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="trade-history">
        <IonList>
          <IonListHeader>Today</IonListHeader>
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
                  {renderStatus('pending')}
                </div>
              </div>
            </div>
          </IonItem>
          <IonItem
            className={classNames('list-item transaction-item', { open: true })}
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
              <div className="sub-info">
                <div className="fee-row">
                  <IonLabel>
                    Fee <span className="amount">0,0005</span>
                  </IonLabel>
                  <IonText>
                    -1,09876 <span className="currency">BTC</span>
                  </IonText>
                </div>
                <div className="info-row">
                  <IonLabel>ADDR</IonLabel>
                  <IonText>8T71hMKw05f96b4dc1gBrLO4ds1f3LMKSX</IonText>
                </div>
                <div className="info-row">
                  <IonLabel>TxID</IonLabel>
                  <IonText>
                    84g96f5hy6mu13971563f95f08gh818s3526h7dpv22d1r006hn8563247855690
                  </IonText>
                </div>
              </div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TradeHistory);
