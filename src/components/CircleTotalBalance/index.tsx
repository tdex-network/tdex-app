import { IonGrid, IonRow } from '@ionic/react';
import React from 'react';

import TdexLogo from '../../assets/img/tdex_logo_black.svg';
import './style.scss';

interface CircleTotalBalanceProps {
  fiatBalance: string;
  lbtcUnit: string;
  totalBalance: string;
}

const CircleTotalBalance: React.FC<CircleTotalBalanceProps> = ({ fiatBalance, lbtcUnit, totalBalance }) => {
  return (
    <div className="circle-total-balance">
      <div className="ion-align-items-center ion-justify-content-center">
        <img src={TdexLogo} alt="tdex logo" />
        <IonGrid>
          <IonRow className="ion-justify-content-center">Total Balance</IonRow>
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
