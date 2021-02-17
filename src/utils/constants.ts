export interface Network {
  messagePrefix: string;
  bech32: string;
  blech32: string;
  bip32: Bip32;
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
  assetHash: string;
  name: string;
  ticker: string;
  coinGeckoID?: string;
  confidentialPrefix: number;
}

interface Bip32 {
  public: number;
  private: number;
}
export const Assets: {
  [key: string]: Network;
} = {
  lbtcRegtest: {
    messagePrefix: '\x18Liquid Signed Message:\n',
    bech32: 'ert',
    blech32: 'el',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 235,
    scriptHash: 75,
    wif: 0xef,
    confidentialPrefix: 4,
    name: 'Liquid Bitcoin',
    ticker: 'LBTC',
    coinGeckoID: 'bitcoin',
    assetHash:
      '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
  },
  lbtcMainnet: {
    messagePrefix: '\x18Liquid Signed Message:\n',
    bech32: 'ex',
    blech32: 'lq',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 57,
    scriptHash: 39,
    wif: 0x80,
    confidentialPrefix: 12,
    name: 'Liquid Bitcoin',
    ticker: 'LBTC',
    coinGeckoID: 'bitcoin',
    assetHash:
      '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
  },
};

export const defaultPrecision = 8;
export const defaultFee = 2000;

export const MAIN_ASSETS = ['lbtc', 'usdt', 'lcad', 'btse'];
