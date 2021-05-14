let network: any, defaultProvider: any;

if (process.env.NODE_ENV !== 'production') {
  network = {
    chain: 'liquid',
    explorer: 'https://blockstream.info/liquid/api',
  };

  defaultProvider = {
    endpoint: 'https://provider.tdex.network:9945',
  };
} else {
  network = {
    chain: 'regtest',
    explorer: 'http://localhost:3001',
  };

  defaultProvider = {
    endpoint: 'http://localhost:9945',
  };
}

export { network, defaultProvider };
