import { IconExchange, IconSettings, IconWallet } from './components/icons';
import Exchange from './pages/Exchange';
import Operations from './redux/containers/operationsContainer';
import QRScanner from './pages/QRScanner';
import Receive from './pages/Receive';
import Settings from './pages/Settings';
import TradeHistory from './pages/TradeHistory';
import TradeSummary from './pages/TradeSummary';
import Wallet from './redux/containers/walletContainer';
import Withdrawal from './redux/containers/withdrawalContainer';
import WithdrawalDetails from './pages/WithdrawalDetails';
import Account from './pages/Account';

export const routerLinks = {
  wallet: '/wallet',
  exchange: '/exchange',
  settings: '/settings',
  tradeSummary: '/tradesummary',
  history: '/history',
  operations: '/operations/:asset_id',
  withdrawalDetails: '/withdraw/:asset_id/details',
  withdrawal: '/withdraw/:asset_id',
  receive: '/receive',
  qrScanner: '/qrscanner',
  account: '/account',
};

export const ROUTES = [
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
];

export const TABS = [
  {
    path: routerLinks.wallet,
    icon: IconWallet,
    component: Wallet,
  },
  {
    path: routerLinks.exchange,
    icon: IconExchange,
    component: Exchange,
  },
  {
    path: routerLinks.settings,
    icon: IconSettings,
    component: Settings,
  },
];
