import type { TDEXMarket } from '../../src/services/tdexService/v1/tradeCore';

export const mockLbtcSendAsset = '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d';
export const mockUsdtReceiveAsset = 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2';

export const mockMarketsLbtcUsdt: TDEXMarket[] = [
  {
    baseAsset: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    quoteAsset: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    provider: {
      name: 'provider1',
      endpoint: 'http://provider1',
    },
  },
  {
    baseAsset: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    quoteAsset: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    provider: {
      name: 'provider2',
      endpoint: 'http://provider2',
    },
  },
  {
    baseAsset: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    quoteAsset: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    provider: {
      name: 'provider3',
      endpoint: 'http://provider3',
    },
  },
  {
    baseAsset: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    quoteAsset: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    provider: {
      name: 'provider4',
      endpoint: 'http://provider4',
    },
  },
];
