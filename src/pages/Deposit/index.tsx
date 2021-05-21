import React from 'react';
import { RouteComponentProps, useLocation } from 'react-router';
import { IonContent, IonPage, IonIcon, IonGrid } from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import { AssetConfig } from '../../utils/constants';
import { network } from '../../redux/config';
import { CurrencyIcon } from '../../components/icons';
import './style.scss';
import Header from '../../components/Header';

interface LocationState {
  depositAssets: AssetConfig[];
}

const Deposit: React.FC<RouteComponentProps> = ({ history }) => {
  const { state } = useLocation<LocationState>();

  const generateGridItems = () => {
    return state?.depositAssets
      ?.map((asset, i) => {
        if (asset.ticker === 'L-BTC' && network.chain !== asset?.chain)
          return null;
        return (
          <button
            className="deposit-grid-item ion-justify-content-center ion-align-items-center"
            key={i}
            onClick={() =>
              history.push({
                pathname: '/receive',
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
              pathname: '/receive',
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
        </button>
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
