import './style.scss';

import { IonGrid, IonRow } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import TdexLogo from '../../assets/img/tdex_logo_black.svg';

interface CircleTotalBalanceProps {
  fiatBalance: string;
  lbtcUnit: string;
  totalBalance: string;
}

const CircleTotalBalance: React.FC<CircleTotalBalanceProps> = ({ fiatBalance, lbtcUnit, totalBalance }) => {
  const { t } = useTranslation();

  return (
    <div className="circle-total-balance">
      <div className="ion-align-items-center ion-justify-content-center">
        <img src={TdexLogo} alt="tdex logo" />
        <IonGrid>
          <IonRow className="ion-justify-content-center">{t('wallet.balance')}</IonRow>
          <IonRow className="ion-justify-content-center" data-cy="total-balance">
            {totalBalance}
          </IonRow>
          <IonRow className="ion-justify-content-center">{lbtcUnit}</IonRow>
          {fiatBalance && <IonRow className="ion-justify-content-center">{fiatBalance}</IonRow>}
        </IonGrid>
      </div>
    </div>
  );
};

export default CircleTotalBalance;
