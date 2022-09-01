import './style.scss';

import { IonContent, IonGrid, IonIcon, IonPage } from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { RouteComponentProps } from 'react-router';

import BtcIcon from '../../assets/img/coins/btc.svg';
import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import { useTypedSelector } from '../../redux/hooks';
import { routerLinks } from '../../routes';
import { BTC_ASSET, MAIN_ASSETS } from '../../utils/constants';

const Deposit: React.FC<RouteComponentProps> = ({ history }) => {
  const network = useTypedSelector(({ settings }) => settings.network);
  const { t } = useTranslation();

  const generateGridItems = useMemo(() => {
    const btcButton = (
      <button
        disabled={network === 'testnet'}
        className="deposit-grid-item ion-justify-content-center ion-align-items-center"
        key="btc"
        onClick={() =>
          history.push({
            pathname: routerLinks.receive,
            state: { depositAsset: BTC_ASSET },
          })
        }
      >
        <img src={BtcIcon} alt="btc icon" className="currency-icon" width={45} height={45} />
        <span className="deposit-grid-item-name">{BTC_ASSET.name}</span>
        <span className="deposit-grid-item-ticker">{BTC_ASSET.ticker}</span>
      </button>
    );

    return [btcButton]
      .concat(
        MAIN_ASSETS[network].map((asset, i) => {
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
              <CurrencyIcon assetHash={asset.assetHash} size={45} />
              <span className="deposit-grid-item-name">{asset.name}</span>
              <span className="deposit-grid-item-ticker">{asset.ticker}</span>
            </button>
          );
        })
      )
      .concat(
        <button
          className="deposit-grid-item ion-justify-content-center ion-align-items-center"
          key="add-asset"
          onClick={() =>
            history.push({
              pathname: routerLinks.receive,
              state: {
                depositAsset: {
                  name: t('liquidAsset'),
                  ticker: t('liquidAsset'),
                },
              },
            })
          }
        >
          <IonIcon class="deposit-grid-item-plus-icon" icon={addCircleOutline} slot="icon-only" color="success" />
          <span className="deposit-grid-item-name">Add Liquid Asset</span>
        </button>
      );
  }, [history, network, t]);

  return (
    <IonPage>
      <IonContent>
        <IonGrid>
          <Header title={t('receive')} hasBackButton={true} />
          <div className="deposit-grid ion-margin-vertical ion-text-center">{generateGridItems}</div>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Deposit;
