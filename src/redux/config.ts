// eslint-disable-next-line import/no-mutable-exports
let network: any, defaultProvider: any;

if (process.env.NODE_ENV === 'production') {
  network = {
    chain: 'liquid',
    explorer: 'https://blockstream.info/liquid/api',
    explorerBitcoin: 'https://blockstream.info/api',
    explorerLiquidUI: 'https://blockstream.info/liquid',
    explorerBitcoinUI: 'https://blockstream.info',
  };

  defaultProvider = {
    endpoint: 'https://provider.tdex.network:9945',
  };
} else {
  network = {
    chain: 'regtest',
    explorer: 'http://localhost:3001',
    explorerBitcoin: 'http://localhost:3000',
    explorerLiquidUI: 'http://localhost:5001',
    explorerBitcoinUI: 'http://localhost:5000',
  };

  defaultProvider = {
    endpoint: 'http://localhost:9945',
  };
}

export { network, defaultProvider };
