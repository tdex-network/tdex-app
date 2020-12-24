let network: any, provider: any;

if (process.env.NODE_ENV == 'development') {
  network = {
    chain: 'regtest',
    explorer: 'http://127.1:3001',
  };

  provider = {
    endpoint: 'http://127.1:9945',
  };
} else {
  network = {
    chain: 'liquid',
    explorer: 'https://blockstream.info/liquid/api',
  };

  provider = {
    endpoint: 'https://provider.tdex.network:9945',
  };
}

export { network, provider };
