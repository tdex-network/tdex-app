import { IconExchange, IconSettings, IconWallet } from './components/icons';
import { Backup } from './pages/Backup';
import { ClaimPegin } from './pages/ClaimPegin';
import DeepRestoration from './pages/DeepRestoration';
import DeleteMnemonic from './pages/DeleteMnemonic';
import Deposit from './pages/Deposit';
import { Exchange } from './pages/Exchange';
import { Explorers } from './pages/Explorers';
import Faq from './pages/Faq';
import { LiquidityProviders } from './pages/LiquidityProvider';
import { Operations } from './pages/Operations';
import Privacy from './pages/Privacy';
import QRScanner from './pages/QRScanner';
import { Receive } from './pages/Receive';
import Settings from './pages/Settings';
import Account from './pages/Settings/Account';
import Network from './pages/Settings/Network';
import { WalletInfo } from './pages/Settings/WalletInfo';
import { ShowMnemonic } from './pages/ShowMnemonic';
import ShowMnemonicSettings from './pages/ShowMnemonic/show-mnemonic-settings';
import Terms from './pages/Terms';
import { TorProxy } from './pages/TorProxy';
import { TradeHistory } from './pages/TradeHistory';
import { TradeSummary } from './pages/TradeSummary';
import TransactionDetails from './pages/TransactionDetails';
import { Wallet } from './pages/Wallet';
import { Withdrawal } from './pages/Withdrawal';

export const routerLinks = {
  wallet: '/wallet',
  exchange: '/exchange',
  tradeSummary: '/tradesummary/:txid',
  history: '/history',
  operations: '/operations/:asset_id',
  transactionDetails: '/transaction/:txid',
  withdrawal: '/withdraw/:asset_id',
  receive: '/receive',
  qrScanner: '/qrscanner/:asset_id',
  backup: '/backup',
  showMnemonic: '/show-mnemonic',
  deposit: '/deposit',
  // Settings
  account: '/account',
  claimPegin: '/settings/claim-pegin',
  deleteMnemonic: '/settings/delete-mnemonic',
  faq: '/faq',
  liquidityProvider: '/liquidity-provider',
  privacy: '/privacy',
  settings: '/settings',
  showMnemonicSettings: '/settings/show-mnemonic',
  walletInfo: '/settings/wallet-info',
  terms: '/terms',
  deepRestoration: '/settings/deep-restoration',
  explorers: '/settings/explorers',
  network: '/settings/network',
  torProxy: '/settings/tor-proxy',
};

export const ROUTES = [
  {
    path: routerLinks.faq,
    component: Faq,
  },
  {
    path: routerLinks.privacy,
    component: Privacy,
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
    path: routerLinks.transactionDetails,
    component: TransactionDetails,
  },
  {
    path: routerLinks.account,
    component: Account,
  },
  {
    path: routerLinks.liquidityProvider,
    component: LiquidityProviders,
  },
  {
    path: routerLinks.deposit,
    component: Deposit,
  },
  {
    path: routerLinks.backup,
    component: Backup,
  },
  {
    path: routerLinks.showMnemonic,
    component: ShowMnemonic,
  },
  {
    path: routerLinks.showMnemonicSettings,
    component: ShowMnemonicSettings,
  },
  {
    path: routerLinks.walletInfo,
    component: WalletInfo,
  },
  {
    path: routerLinks.deleteMnemonic,
    component: DeleteMnemonic,
  },
  {
    path: routerLinks.deepRestoration,
    component: DeepRestoration,
  },
  {
    path: routerLinks.claimPegin,
    component: ClaimPegin,
  },
  {
    path: routerLinks.explorers,
    component: Explorers,
  },
  {
    path: routerLinks.network,
    component: Network,
  },
  {
    path: routerLinks.torProxy,
    component: TorProxy,
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
