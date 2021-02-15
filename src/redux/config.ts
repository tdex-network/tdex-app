let network: any, provider: any;

if (process.env.NODE_ENV === 'production') {
  network = {
    chain: 'liquid',
    explorer: 'https://blockstream.info/liquid/api',
  };

  provider = {
    endpoint: 'https://provider.tdex.network:9945',
  };
} else {
  network = {
    chain: 'regtest',
    explorer: 'http://localhost:3001',
  };

  provider = {
    endpoint: 'http://localhost:9945',
  };
}

console.log(network);

export { network, provider };
