// eslint-disable-next-line import/no-mutable-exports
let network: any, defaultProvider: any;

const blockstreamExplorerEndpoints = {
  liquid: {
    explorerLiquidAPI: 'https://blockstream.info/liquid/api',
    explorerLiquidUI: 'https://blockstream.info/liquid',
    explorerBitcoinAPI: 'https://blockstream.info/api',
    explorerBitcoinUI: 'https://blockstream.info',
  },
  testnet: {
    explorerLiquidAPI: 'https://blockstream.info/liquidtestnet/api',
    explorerLiquidUI: 'https://blockstream.info/liquidtestnet',
    explorerBitcoinAPI: 'https://blockstream.info/testnet/api',
    explorerBitcoinUI: 'https://blockstream.info/testnet',
  },
};

const mempoolExplorerEndpoints = {
  liquid: {
    explorerLiquidAPI: 'https://liquid.network/api',
    explorerLiquidUI: 'https://liquid.network',
    explorerBitcoinAPI: 'https://mempool.space/api',
    explorerBitcoinUI: 'https://mempool.space',
  },
  testnet: {
    explorerLiquidAPI: 'https://liquid.network/liquidtestnet/api',
    explorerLiquidUI: 'https://liquid.network/testnet',
    explorerBitcoinAPI: 'https://mempool.space/testnet/api',
    explorerBitcoinUI: 'https://mempool.space/testnet',
  },
};

const defaultProviderEndpoints = {
  liquid: 'https://provider.tdex.network:9945',
  testnet: 'https://provider.tdex.network:19945',
  regtest: 'http://localhost:9945',
};

// Used only to initialize Redux initialState
if (process.env.NODE_ENV === 'production') {
  network = {
    chain: 'liquid',
    explorerLiquidAPI: mempoolExplorerEndpoints.liquid.explorerLiquidAPI,
    explorerLiquidUI: mempoolExplorerEndpoints.liquid.explorerLiquidUI,
    explorerBitcoinAPI: mempoolExplorerEndpoints.liquid.explorerBitcoinAPI,
    explorerBitcoinUI: mempoolExplorerEndpoints.liquid.explorerBitcoinUI,
    electrsBatchAPI: 'https://electrs-batch.sevenlabs.io',
  };
  defaultProvider = {
    name: 'Default provider',
    endpoint: defaultProviderEndpoints.liquid,
  };
} else if (process.env.REACT_APP_CHAIN === 'testnet') {
  network = {
    chain: 'testnet',
    explorerLiquidAPI: mempoolExplorerEndpoints.testnet.explorerLiquidAPI,
    explorerLiquidUI: mempoolExplorerEndpoints.testnet.explorerLiquidUI,
    explorerBitcoinAPI: mempoolExplorerEndpoints.testnet.explorerBitcoinAPI,
    explorerBitcoinUI: mempoolExplorerEndpoints.testnet.explorerBitcoinUI,
    electrsBatchAPI: 'https://electrs-batch-testnet.sevenlabs.io',
  };
  defaultProvider = {
    name: 'Default provider',
    endpoint: defaultProviderEndpoints.testnet,
  };
} else {
  network = {
    chain: 'regtest',
    explorerLiquidAPI: 'http://localhost:3001',
    explorerLiquidUI: 'http://localhost:5001',
    explorerBitcoinAPI: 'http://localhost:3000',
    explorerBitcoinUI: 'http://localhost:5000',
    electrsBatchAPI: 'http://localhost:5500',
  };
  defaultProvider = {
    name: 'Default provider',
    endpoint: defaultProviderEndpoints.regtest,
  };
}

export { network, defaultProvider, blockstreamExplorerEndpoints, mempoolExplorerEndpoints, defaultProviderEndpoints };
