import {
  IonContent,
  IonList,
  IonModal,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';
import React, { useState } from 'react';

// components
import {
  IconSwap,
  IconSearch,
  IconClose,
  IconBTC,
} from '../../components/icons';
import ExchangeRow from '../../components/ExchangeRow';

// styles
import './style.scss';

const Exchange: React.FC = () => {
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader className="exchange-header">
        <IonToolbar>
          <IonTitle>Exchange</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="exchange-content">
        <div className="exchange">
          <div className="exchange-divider">
            <IconSwap />
          </div>
          <ExchangeRow setOpenSearch={setOpenSearch} />
          <ExchangeRow setOpenSearch={setOpenSearch} />
        </div>
        <div className="buttons">
          <IonButton className="main-button" routerLink="tradeSummary">
            Confirm
          </IonButton>
        </div>
        <div className="search">
          <IonModal cssClass="modal-small" isOpen={openSearch}>
            <IonHeader>
              <div>
                <label className="search-bar">
                  <IconSearch />
                  <input placeholder="Search currency" type="text" />
                  <IconClose />
                </label>
              </div>
            </IonHeader>
            <IonContent className="search-content">
              <IonList>
                <IonItem>
                  <div className="search-item-name">
                    <span className="icon-wrapper medium">
                      <IconBTC width="24px" height="24px"></IconBTC>
                    </span>
                    <p>BTC Bitcoin</p>
                  </div>
                  <div className="search-item-amount">
                    <p>
                      9,500 <span>EUR</span>
                    </p>
                  </div>
                </IonItem>
                <IonItem>
                  <div className="search-item-name">
                    <span className="icon-wrapper medium">
                      <IconBTC width="24px" height="24px"></IconBTC>
                    </span>
                    <p>BTC Bitcoin</p>
                  </div>
                  <div className="search-item-amount">
                    <p>
                      9,500 <span>EUR</span>
                    </p>
                  </div>
                </IonItem>
                <IonItem>
                  <div className="search-item-name">
                    <span className="icon-wrapper medium">
                      <IconBTC width="24px" height="24px"></IconBTC>
                    </span>
                    <p>BTC Bitcoin</p>
                  </div>
                  <div className="search-item-amount">
                    <p>
                      9,500 <span>EUR</span>
                    </p>
                  </div>
                </IonItem>
                <IonItem>
                  <div className="search-item-name">
                    <span className="icon-wrapper medium">
                      <IconBTC width="24px" height="24px"></IconBTC>
                    </span>
                    <p>BTC Bitcoin</p>
                  </div>
                  <div className="search-item-amount">
                    <p>
                      9,500 <span>EUR</span>
                    </p>
                  </div>
                </IonItem>
                <IonItem>
                  <div className="search-item-name">
                    <span className="icon-wrapper medium">
                      <IconBTC width="24px" height="24px"></IconBTC>
                    </span>
                    <p>BTC Bitcoin</p>
                  </div>
                  <div className="search-item-amount">
                    <p>
                      9,500 <span>EUR</span>
                    </p>
                  </div>
                </IonItem>
              </IonList>
            </IonContent>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Exchange;
