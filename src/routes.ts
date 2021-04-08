import { IconExchange, IconSettings, IconWallet } from './components/icons';
import Exchange from './redux/containers/exchangeContainer';
import Operations from './redux/containers/operationsContainer';
import QRScanner from './pages/QRScanner';
import Receive from './pages/Receive';
import Settings from './pages/Settings';
import TradeHistory from './redux/containers/exchangeHistoryContainer';
import TradeSummary from './redux/containers/tradeSummaryContainer';
import Wallet from './redux/containers/walletContainer';
import Withdrawal from './redux/containers/withdrawalContainer';
import WithdrawalDetails from './pages/WithdrawalDetails';
import Account from './pages/Account';
import LiquidityProviders from './redux/containers/liquidityProvidersContainer';
import Faq from './pages/Faq';
import Terms from './pages/Terms';

export const routerLinks = {
  wallet: '/wallet',
  exchange: '/exchange',
  settings: '/settings',
  tradeSummary: '/tradesummary/:txid',
  history: '/history',
  operations: '/operations/:asset_id',
  withdrawalDetails: '/withdraw/:txid/details',
  withdrawal: '/withdraw/:asset_id',
  receive: '/receive',
  qrScanner: '/qrscanner/:asset_id',
  account: '/account/:pin',
  liquidityProvider: '/liquidity-provider',
  faq: '/faq',
  terms: '/terms',
};

export const ROUTES = [
  {
    path: routerLinks.faq,
    component: Faq,
  },
  {
    path: routerLinks.terms,
    component: Terms,
  },
  {
    path: routerLinks.wallet,
    component: Wallet,
  },
  {
    path: routerLinks.exchange,
    component: Exchange,
  },
  {
    path: routerLinks.settings,
    component: Settings,
  },
  {
    path: routerLinks.history,
    component: TradeHistory,
  },
  {
    path: routerLinks.tradeSummary,
    component: TradeSummary,
  },
  {
    path: routerLinks.withdrawal,
    component: Withdrawal,
  },
  {
    path: routerLinks.receive,
    component: Receive,
  },
  {
    path: routerLinks.qrScanner,
    component: QRScanner,
  },
  {
    path: routerLinks.operations,
    component: Operations,
  },
  {
    path: routerLinks.withdrawalDetails,
    component: WithdrawalDetails,
  },
  {
    path: routerLinks.account,
    component: Account,
  },
  {
    path: routerLinks.liquidityProvider,
    component: LiquidityProviders,
  },
];

export const TABS = [
  {
    name: 'wallet',
    path: routerLinks.wallet,
    icon: IconWallet,
    component: Wallet,
  },
  {
    name: 'exchange',
    path: routerLinks.exchange,
    icon: IconExchange,
    component: Exchange,
  },
  {
    name: 'settings',
    path: routerLinks.settings,
    icon: IconSettings,
    component: Settings,
  },
];
