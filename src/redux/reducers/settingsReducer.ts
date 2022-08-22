import type { NetworkString } from 'tdex-sdk';

import type { LbtcDenomination } from '../../utils/constants';
import { CURRENCIES, LBTC_DENOMINATIONS } from '../../utils/constants';
import type { ActionType } from '../../utils/types';
import {
  SET_CURRENCY,
  SET_EXPLORER_LIQUID_API,
  SET_EXPLORER_BITCOIN_API,
  SET_EXPLORER_BITCOIN_UI,
  SET_EXPLORER_LIQUID_UI,
  SET_LBTC_DENOMINATION,
  SET_THEME,
  SET_TOR_PROXY,
  SET_NETWORK,
  SET_DEFAULT_PROVIDER,
} from '../actions/settingsActions';
import { defaultProvider, network } from '../config';

export interface CurrencyInterface {
  name: string;
  symbol: string;
  value: 'eur' | 'usd' | 'cad' | 'btc';
}

export interface SettingsState {
  currency: CurrencyInterface;
  defaultProvider: string;
  denominationLBTC: LbtcDenomination;
  explorerLiquidAPI: string;
  explorerBitcoinAPI: string;
  explorerBitcoinUI: string;
  explorerLiquidUI: string;
  electrsBatchAPI: string;
  network: NetworkString;
  theme: string;
  torProxy: string;
}

const initialState: SettingsState = {
  currency: CURRENCIES[0],
  defaultProvider: defaultProvider.endpoint,
  denominationLBTC: LBTC_DENOMINATIONS[0],
  explorerLiquidAPI: network.explorerLiquidAPI,
  explorerBitcoinAPI: network.explorerBitcoinAPI,
  explorerBitcoinUI: network.explorerBitcoinUI,
  explorerLiquidUI: network.explorerLiquidUI,
  electrsBatchAPI: network.electrsBatchAPI,
  theme: 'dark',
  network: network.chain,
  torProxy: 'https://proxy.tdex.network',
};

const settingsReducer = (state: SettingsState = initialState, action: ActionType): SettingsState => {
  switch (action.type) {
    case SET_LBTC_DENOMINATION:
      return {
        ...state,
        denominationLBTC: action.payload,
      };
    case SET_CURRENCY:
      return {
        ...state,
        currency: action.payload,
      };
    case SET_DEFAULT_PROVIDER:
      return {
        ...state,
        defaultProvider: action.payload,
      };
    case SET_NETWORK:
      return {
        ...state,
        network: action.payload,
      };
    case SET_EXPLORER_LIQUID_API:
      return {
        ...state,
        explorerLiquidAPI: action.payload,
      };
    case SET_EXPLORER_BITCOIN_API:
      return {
        ...state,
        explorerBitcoinAPI: action.payload,
      };
    case SET_EXPLORER_BITCOIN_UI:
      return {
        ...state,
        explorerBitcoinUI: action.payload,
      };
    case SET_EXPLORER_LIQUID_UI:
      return {
        ...state,
        explorerLiquidUI: action.payload,
      };
    case SET_TOR_PROXY:
      return {
        ...state,
        torProxy: action.payload,
      };
    case SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};

export default settingsReducer;
