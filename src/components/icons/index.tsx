import type { CSSProperties } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';

import BjdeIcon from '../../assets/img/coins/blockstream_jade.svg';
import BtseIcon from '../../assets/img/coins/btse.svg';
import CurrencyPlaceholderIcon from '../../assets/img/coins/currency-placeholder.svg';
import LbtcIcon from '../../assets/img/coins/lbtc.svg';
import LcadIcon from '../../assets/img/coins/lcad.svg';
import UsdtIcon from '../../assets/img/coins/usdt.svg';
import DepositIconBlack from '../../assets/img/deposit-black.svg';
import DepositIcon from '../../assets/img/deposit.svg';
import {
  BJDE_TICKER,
  BTSE_TICKER,
  LBTC_TICKER,
  LCAD_TICKER,
  USDT_TICKER,
} from '../../utils/constants';
import { TxTypeEnum } from '../../utils/types';

interface IconInterface {
  width?: string;
  height?: string;
  viewBox?: string;
  fill?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: any) => void;
}

export const IconWallet = (props: IconInterface): any => (
  <svg
    width="20"
    height="20"
    {...props}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      id="wallet"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 10.5C12.17 10.5 11.5 9.83 11.5 9C11.5 8.17 12.17 7.5 13 7.5C13.83 7.5 14.5 8.17 14.5 9C14.5 9.83 13.83 10.5 13 10.5ZM10 5C9.45 5 9 5.45 9 6V12C9 12.55 9.45 13 10 13H19V5H10ZM7 13V5C7 3.9 7.89 3 9 3H18V2C18 0.9 17.1 0 16 0H2C0.89 0 0 0.9 0 2V16C0 17.1 0.89 18 2 18H16C17.1 18 18 17.1 18 16V15H9C7.89 15 7 14.1 7 13Z"
    />
  </svg>
);

export const IconExchange = (props: IconInterface): any => (
  <svg
    width="20"
    height="20"
    {...props}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.29153 8C4.29153 4.69 6.98153 2 10.2915 2C11.0815 2 11.8515 2.15 12.5415 2.44C12.9015 2.59 13.3115 2.48 13.5815 2.21C14.0915 1.7 13.9115 0.84 13.2415 0.57C12.3315 0.2 11.3315 0 10.2915 0C5.87153 0 2.29153 3.58 2.29153 8H0.501534C0.0515344 8 -0.168466 8.54 0.151534 8.85L2.94153 11.64C3.14153 11.84 3.45153 11.84 3.65153 11.64L6.44153 8.85C6.75153 8.54 6.53153 8 6.08153 8H4.29153ZM16.9415 4.35L14.1515 7.14C13.8315 7.46 14.0515 8 14.5015 8H16.2915C16.2915 11.31 13.6015 14 10.2915 14C9.50153 14 8.73153 13.85 8.04153 13.56C7.68153 13.41 7.27153 13.52 7.00153 13.79C6.49153 14.3 6.67153 15.16 7.34153 15.43C8.25153 15.8 9.25153 16 10.2915 16C14.7115 16 18.2915 12.42 18.2915 8H20.0815C20.5315 8 20.7515 7.46 20.4315 7.15L17.6415 4.36C17.4515 4.16 17.1315 4.16 16.9415 4.35Z"
    />
  </svg>
);

export const IconSettings = (props: IconInterface): any => (
  <svg
    width="20"
    height="20"
    {...props}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.72933 13.5C7.79933 13.5 6.22933 11.93 6.22933 10C6.22933 8.07 7.79933 6.5 9.72933 6.5C11.6593 6.5 13.2293 8.07 13.2293 10C13.2293 11.93 11.6593 13.5 9.72933 13.5ZM17.1593 10.98C17.1993 10.66 17.2293 10.34 17.2293 10C17.2293 9.66 17.1993 9.34 17.1593 9.02L19.2693 7.37C19.4593 7.22 19.5093 6.95 19.3893 6.73L17.3893 3.27C17.2693 3.05 16.9993 2.97 16.7793 3.05L14.2893 4.05C13.7693 3.65 13.2093 3.32 12.5993 3.07L12.2193 0.42C12.1893 0.18 11.9793 0 11.7293 0H7.72933C7.47933 0 7.26933 0.18 7.23933 0.42L6.85933 3.07C6.24933 3.32 5.68933 3.66 5.16933 4.05L2.67933 3.05C2.44933 2.96 2.18933 3.05 2.06933 3.27L0.0693316 6.73C-0.0606684 6.95 -0.000668394 7.22 0.189332 7.37L2.29933 9.02C2.25933 9.34 2.22933 9.67 2.22933 10C2.22933 10.33 2.25933 10.66 2.29933 10.98L0.189332 12.63C-0.000668394 12.78 -0.0506684 13.05 0.0693316 13.27L2.06933 16.729C2.18933 16.95 2.45933 17.03 2.67933 16.95L5.16933 15.95C5.68933 16.35 6.24933 16.68 6.85933 16.93L7.23933 19.58C7.26933 19.819 7.47933 20 7.72933 20H11.7293C11.9793 20 12.1893 19.819 12.2193 19.58L12.5993 16.93C13.2093 16.68 13.7693 16.34 14.2893 15.95L16.7793 16.95C17.0093 17.04 17.2693 16.95 17.3893 16.729L19.3893 13.27C19.5093 13.05 19.4593 12.78 19.2693 12.63L17.1593 10.98Z"
    />
  </svg>
);

export const IconCheck = (props: IconInterface): any => (
  <svg
    width="20"
    height="20"
    {...props}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1.89679 6.60094C1.46287 6.1913 0.759353 6.1913 0.325437 6.60094C-0.108479 7.01058 -0.108479 7.67474 0.325437 8.08438L5.88099 13.3291C6.31491 13.7388 7.01842 13.7388 7.45234 13.3291L19.6746 1.79067C20.1085 1.38103 20.1085 0.716872 19.6746 0.307231C19.2406 -0.10241 18.5371 -0.10241 18.1032 0.307231L6.66667 11.104L1.89679 6.60094Z" />
  </svg>
);

export const IconCopy = (props: IconInterface): JSX.Element => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 16H7C6.45 16 6 15.55 6 15V3C6 2.45 6.45 2 7 2H19C19.55 2 20 2.45 20 3V15C20 15.55 19.55 16 19 16ZM20 0H6C4.9 0 4 0.9 4 2V16C4 17.1 4.9 18 6 18H20C21.1 18 22 17.1 22 16V2C22 0.9 21.1 0 20 0ZM1 4C0.45 4 0 4.45 0 5V20C0 21.1 0.9 22 2 22H17C17.55 22 18 21.55 18 21C18 20.45 17.55 20 17 20H3C2.45 20 2 19.55 2 19V5C2 4.45 1.55 4 1 4Z"
    />
  </svg>
);

export const IconQR = (props: IconInterface): JSX.Element => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 6H6V2H2V6ZM2 8H6C7.1 8 8 7.1 8 6V2C8 0.9 7.1 0 6 0H2C0.9 0 0 0.9 0 2V6C0 7.1 0.9 8 2 8Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 16H6V12H2V16ZM2 18H6C7.1 18 8 17.1 8 16V12C8 10.9 7.1 10 6 10H2C0.9 10 0 10.9 0 12V16C0 17.1 0.9 18 2 18Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 6H16V2H12V6ZM10 2V6C10 7.1 10.9 8 12 8H16C17.1 8 18 7.1 18 6V2C18 0.9 17.1 0 16 0H12C10.9 0 10 0.9 10 2Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 17.5002V16.5002C18 16.2202 17.78 16.0002 17.5 16.0002H16.5C16.22 16.0002 16 16.2202 16 16.5002V17.5002C16 17.7802 16.22 18.0002 16.5 18.0002H17.5C17.78 18.0002 18 17.7802 18 17.5002Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 10.5002V11.5002C10 11.7802 10.22 12.0002 10.5 12.0002H11.5C11.78 12.0002 12 11.7802 12 11.5002V10.5002C12 10.2202 11.78 10.0002 11.5 10.0002H10.5C10.22 10.0002 10 10.2202 10 10.5002Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5 12.0002H12.5C12.22 12.0002 12 12.2202 12 12.5002V13.5002C12 13.7802 12.22 14.0002 12.5 14.0002H13.5C13.78 14.0002 14 13.7802 14 13.5002V12.5002C14 12.2202 13.78 12.0002 13.5 12.0002Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 14.5002V15.5002C10 15.7802 10.22 16.0002 10.5 16.0002H11.5C11.78 16.0002 12 15.7802 12 15.5002V14.5002C12 14.2202 11.78 14.0002 11.5 14.0002H10.5C10.22 14.0002 10 14.2202 10 14.5002Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.5 18.0002H13.5C13.78 18.0002 14 17.7802 14 17.5002V16.5002C14 16.2202 13.78 16.0002 13.5 16.0002H12.5C12.22 16.0002 12 16.2202 12 16.5002V17.5002C12 17.7802 12.22 18.0002 12.5 18.0002Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.5 16.0002H15.5C15.78 16.0002 16 15.7802 16 15.5002V14.5002C16 14.2202 15.78 14.0002 15.5 14.0002H14.5C14.22 14.0002 14 14.2202 14 14.5002V15.5002C14 15.7802 14.22 16.0002 14.5 16.0002Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.5 10.0002H14.5C14.22 10.0002 14 10.2202 14 10.5002V11.5002C14 11.7802 14.22 12.0002 14.5 12.0002H15.5C15.78 12.0002 16 11.7802 16 11.5002V10.5002C16 10.2202 15.78 10.0002 15.5 10.0002Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.5 14.0002H17.5C17.78 14.0002 18 13.7802 18 13.5002V12.5002C18 12.2202 17.78 12.0002 17.5 12.0002H16.5C16.22 12.0002 16 12.2202 16 12.5002V13.5002C16 13.7802 16.22 14.0002 16.5 14.0002Z"
    />
  </svg>
);

export const CurrencyIcon = ({ currency, ...props }: any): any => {
  switch (currency?.toUpperCase()) {
    case LBTC_TICKER:
      return <img src={LbtcIcon} {...props} alt="L-BTC" />;
    case USDT_TICKER:
      return <img src={UsdtIcon} {...props} alt="USDT" />;
    case LCAD_TICKER:
      return <img src={LcadIcon} {...props} alt="LCAD" />;
    case BTSE_TICKER:
      return <img src={BtseIcon} {...props} alt="BTSE" />;
    case BJDE_TICKER:
      return <img src={BjdeIcon} {...props} alt="Blockstream Jade" />;
    default:
      return <img src={CurrencyPlaceholderIcon} {...props} alt="placeholder" />;
  }
};

export const TxIcon = ({ type }: any): any => {
  const theme = useSelector((state: any) => state.settings.theme);
  const themeIcon = theme === 'light' ? DepositIconBlack : DepositIcon;
  switch (type) {
    case TxTypeEnum.Deposit:
      return <img className="deposit" src={themeIcon} alt="deposit" />;
    case TxTypeEnum.Withdraw:
      return <img className="withdraw" src={themeIcon} alt="withdraw" />;
    default:
      return <img src={CurrencyPlaceholderIcon} alt="currency placeholder" />;
  }
};
