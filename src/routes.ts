import { IconExchange, IconSettings, IconWallet } from './components/icons';
// import Exchange from "./pages/Exchange"
// import Operations from "./pages/Operations"
// import QRScanner from "./pages/QRScanner"
// import Recieve from "./pages/Recieve"
// import Settings from "./pages/Settings"
// import TradeHistory from "./pages/TradeHistory"
// import TradeSummary from "./pages/TradeSummary"
// import Wallet from "./pages/Wallet"
// import Withdrawal from "./pages/Withdrawal"

export const routerLinks = {
  wallet: '/wallet',
  exchange: '/exchange',
  settings: '/settings',
  tradeSummary: '/tradesummary',
  history: '/history',
  withdrawal: '/withdraw',
  recieve: '/recieve',
  qrScanner: '/qrscanner',
  operations: '/operations',
};

// export const ROUTES = [
//   {
//     path: routerLinks.wallet,
//     component: Wallet,
//   },
//   {
//     path: routerLinks.exchange,
//     component: Exchange,
//   },
//   {
//     path: routerLinks.settings,
//     component: Settings,
//   },
//   {
//     path: routerLinks.history,
//     component: TradeHistory,
//   },
//   {
//     path: routerLinks.tradeSummary,
//     component: TradeSummary,
//   },
//   {
//     path: routerLinks.withdrawal,
//     component: Withdrawal,
//   },
//   {
//     path: routerLinks.recieve,
//     component: Recieve,
//   },
//   {
//     path: routerLinks.qrScanner,
//     component: QRScanner,
//   },
//   {
//     path: routerLinks.operations,
//     component: Operations,
//   }
// ]

export const TABS = [
  {
    path: routerLinks.wallet,
    icon: IconWallet,
  },
  {
    path: routerLinks.exchange,
    icon: IconExchange,
  },
  {
    path: routerLinks.settings,
    icon: IconSettings,
  },
];
