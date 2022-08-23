// Used only to initialize Redux initialState
// eslint-disable-next-line import/no-mutable-exports
import type { NetworkString } from 'tdex-sdk';

// eslint-disable-next-line import/no-mutable-exports
let config: {
  explorers: {
    chain: NetworkString;
    explorerLiquidAPI: string;
    explorerBitcoinAPI: string;
    explorerLiquidUI: string;
    explorerBitcoinUI: string;
    electrsBatchAPI: string;
  };
  defaultProvider: {
    name: string;
    endpoint: string;
  };
};

const blockstreamExplorerEndpoints = {
  liquid: {
    explorerLiquidAPI: 'https://blockstream.info/liquid/api',
    explorerLiquidUI: 'https://blockstream.info/liquid',
    explorerBitcoinAPI: 'https://blockstream.info/api',
    explorerBitcoinUI: 'https://blockstream.info',
    electrsBatchAPI: 'https://electrs-batch-blockstream.sevenlabs.io',
  },
  testnet: {
    explorerLiquidAPI: 'https://blockstream.info/liquidtestnet/api',
    explorerLiquidUI: 'https://blockstream.info/liquidtestnet',
    explorerBitcoinAPI: 'https://blockstream.info/testnet/api',
    explorerBitcoinUI: 'https://blockstream.info/testnet',
    electrsBatchAPI: 'https://electrs-batch-testnet.sevenlabs.io',
  },
};

const mempoolExplorerEndpoints = {
  liquid: {
    explorerLiquidAPI: 'https://liquid.network/api',
    explorerLiquidUI: 'https://liquid.network',
    explorerBitcoinAPI: 'https://mempool.space/api',
    explorerBitcoinUI: 'https://mempool.space',
    electrsBatchAPI: 'https://electrs-batch-mempool.sevenlabs.io',
  },
  testnet: {
    explorerLiquidAPI: 'https://liquid.network/liquidtestnet/api',
    explorerLiquidUI: 'https://liquid.network/testnet',
    explorerBitcoinAPI: 'https://mempool.space/testnet/api',
    explorerBitcoinUI: 'https://mempool.space/testnet',
    electrsBatchAPI: 'https://electrs-batch-testnet.sevenlabs.io',
  },
};

const defaultProviderEndpoints = {
  liquid: 'https://provider.tdex.network:9945',
  testnet: 'https://provider.tdex.network:19945',
  regtest: 'http://localhost:9945',
};

const configProduction: typeof config = {
  explorers: {
    chain: 'liquid',
    explorerLiquidAPI: mempoolExplorerEndpoints.liquid.explorerLiquidAPI,
    explorerLiquidUI: mempoolExplorerEndpoints.liquid.explorerLiquidUI,
    explorerBitcoinAPI: mempoolExplorerEndpoints.liquid.explorerBitcoinAPI,
    explorerBitcoinUI: mempoolExplorerEndpoints.liquid.explorerBitcoinUI,
    electrsBatchAPI: mempoolExplorerEndpoints.liquid.electrsBatchAPI,
  },
  defaultProvider: {
    name: 'Default provider',
    endpoint: defaultProviderEndpoints.liquid,
  },
};

const configTestnet: typeof config = {
  explorers: {
    chain: 'testnet',
    explorerLiquidAPI: mempoolExplorerEndpoints.testnet.explorerLiquidAPI,
    explorerLiquidUI: mempoolExplorerEndpoints.testnet.explorerLiquidUI,
    explorerBitcoinAPI: mempoolExplorerEndpoints.testnet.explorerBitcoinAPI,
    explorerBitcoinUI: mempoolExplorerEndpoints.testnet.explorerBitcoinUI,
    electrsBatchAPI: mempoolExplorerEndpoints.testnet.electrsBatchAPI,
  },
  defaultProvider: {
    name: 'Default provider',
    endpoint: defaultProviderEndpoints.testnet,
  },
};

const configRegtest: typeof config = {
  explorers: {
    chain: 'regtest',
    explorerLiquidAPI: 'http://localhost:3001',
    explorerLiquidUI: 'http://localhost:5001',
    explorerBitcoinAPI: 'http://localhost:3000',
    explorerBitcoinUI: 'http://localhost:5000',
    electrsBatchAPI: 'http://localhost:5500',
  },
  defaultProvider: {
    name: 'Default provider',
    endpoint: defaultProviderEndpoints.regtest,
  },
};

if (process.env.NODE_ENV === 'production') {
  config = configProduction;
} else if (process.env.REACT_APP_CHAIN === 'testnet') {
  config = configTestnet;
} else {
  config = configRegtest;
}

export {
  config,
  configRegtest,
  configTestnet,
  configProduction,
  blockstreamExplorerEndpoints,
  mempoolExplorerEndpoints,
  defaultProviderEndpoints,
};
