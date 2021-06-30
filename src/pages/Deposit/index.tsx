import { IonContent, IonPage, IonIcon, IonGrid } from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import React from 'react';
import type { RouteComponentProps } from 'react-router';

import Header from '../../components/Header';
import { CurrencyIcon } from '../../components/icons';
import { network } from '../../redux/config';
import './style.scss';
import { routerLinks } from '../../routes';
import { BTC_ASSET, MAIN_ASSETS } from '../../utils/constants';

const Deposit: React.FC<RouteComponentProps> = ({ history }) => {
  const generateGridItems = () => {
    return MAIN_ASSETS.concat(BTC_ASSET)
      .map((asset, i) => {
        if (asset.ticker === 'L-BTC' && network.chain !== asset?.chain)
          return null;
        return (
          <button
            className="deposit-grid-item ion-justify-content-center ion-align-items-center"
            key={i}
            onClick={() =>
              history.push({
                pathname: routerLinks.receive,
                state: { depositAsset: asset },
              })
            }
          >
            <CurrencyIcon currency={asset.ticker} />
            <span className="deposit-grid-item-name">{asset.name}</span>
            <span className="deposit-grid-item-ticker">{asset.ticker}</span>
          </button>
        );
      })
      .concat(
        <button
          className="deposit-grid-item ion-justify-content-center ion-align-items-center"
          key="add-asset"
          onClick={() =>
            history.push({
              pathname: routerLinks.receive,
              state: {
                depositAsset: {
                  name: 'Liquid Asset',
                  ticker: 'Liquid Asset',
                },
              },
            })
          }
        >
          <IonIcon
            class="deposit-grid-item-plus-icon"
            icon={addCircleOutline}
            slot="icon-only"
            color="success"
          />
          <span className="deposit-grid-item-name">Add Liquid Asset</span>
        </button>,
      );
  };

  return (
    <IonPage>
      <IonContent>
        <IonGrid>
          <Header title="DEPOSIT" hasBackButton={true} />
          <div className="deposit-grid ion-margin-vertical ion-text-center">
            {generateGridItems()}
          </div>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Deposit;
