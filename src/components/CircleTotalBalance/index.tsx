import './style.scss';
import { IonGrid, IonRow } from '@ionic/react';
import classNames from 'classnames';
import React from 'react';

import TdexLogo from '../../assets/img/tdex_logo_black.svg';
import { useAppStore } from '../../store/appStore';

interface CircleTotalBalanceProps {
  fiatBalance: string;
  lbtcUnit: string;
  totalBalance: string;
}

const CircleTotalBalance: React.FC<CircleTotalBalanceProps> = ({ fiatBalance, lbtcUnit, totalBalance }) => {
  const isFetchingUtxos = useAppStore.getState().isFetchingUtxos;
  const isFetchingTransactions = useAppStore.getState().isFetchingTransactions;

  return (
    <div
      className={classNames('circle-total-balance', {
        animate: !(isFetchingTransactions || isFetchingUtxos),
        'animate-not': isFetchingTransactions || isFetchingUtxos,
      })}
    >
      <div className="ion-align-items-center ion-justify-content-center">
        <img src={TdexLogo} alt="tdex logo" />
        <IonGrid>
          <IonRow className="ion-justify-content-center">Total Balance</IonRow>
          <IonRow className="ion-justify-content-center" data-testid="total-balance">
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
