import React from 'react';
import TdexLogo from '../../assets/img/tdex_logo_black.svg';
import './style.scss';

const CircleTotalBalance: React.FC = () => {
  return (
    <div className="circle-total-balance">
      <div className="ion-text-center ion-justify-content-center ion-align-items-center">
        <img src={TdexLogo} alt="tdex logo" />
      </div>
    </div>
  );
};

export default CircleTotalBalance;
