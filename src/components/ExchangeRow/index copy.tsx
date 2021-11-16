import type { InputChangeEventDetail } from '@ionic/core';
import { IonIcon, IonInput, IonSpinner, IonText, useIonViewDidEnter, useIonViewDidLeave } from '@ionic/react';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import { chevronDownOutline } from 'ionicons/icons';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { TDEXTrade } from '../../redux/actionTypes/tdexActionTypes';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import ExchangeSearch from '../../redux/containers/exchangeSearchContainer';
import { defaultPrecision } from '../../utils/constants';
import type { AssetConfig, LbtcDenomination } from '../../utils/constants';
import { fromSatoshi, fromSatoshiFixed, isLbtc, toLBTCwithUnit, toSatoshi } from '../../utils/helpers';
import { sanitizeInputAmount } from '../../utils/input';
import { onPressEnterKeyCloseKeyboard, setAccessoryBar } from '../../utils/keyboard';
import { bestPrice, calculatePrice, createDiscoverer, createTraderClient } from '../../utils/tdex';
import type { AssetWithTicker } from '../../utils/tdex';
import { CurrencyIcon } from '../icons';
import './style.scss';
import { DiscoveryOpts } from 'tdex-sdk';

import TradeRowInput from './trade-row-input';

const ERROR_BALANCE_TOO_LOW = 'Amount is greater than your balance';

interface ExchangeRowsProps {
  
}

const ExchangeRows: React.FC<ExchangeRowsProps> = ({

}) => {

  return (
    <>
      <TradeRowInput
        type='send'
        value={}
        isLoading={isLoading}
        error={error}

      ></TradeRowInput>
    </>
  );
};

export default ExchangeRow;
