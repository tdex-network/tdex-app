import assert from 'assert';
import type { TradeOrder } from 'tdex-sdk';
import { bestBalanceDiscovery, bestPriceDiscovery, combineDiscovery, Discoverer, TradeType } from 'tdex-sdk';
import type TraderClientInterface from 'tdex-sdk/dist/grpcClientInterface';

import * as tdexUtils from '../src/utils/tdex';

import MockTraderClientInterface from './fixtures/mockTraderClientInterface';
import { marketsLbtcUsdtSameFee, mockLbtcSendAsset, mockUsdtReceiveAsset } from './fixtures/trade';

const makeOrder =
  (type: TradeType) =>
  (trader: TraderClientInterface): TradeOrder => ({
    traderClient: trader,
    market: {
      quoteAsset: '',
      baseAsset: '',
      provider: { name: '', endpoint: '' },
    },
    type,
  });

describe('discovery strategies', () => {
  let traderClient1: TraderClientInterface,
    traderClient2: TraderClientInterface,
    traderClient3: TraderClientInterface,
    traderClient4: TraderClientInterface;

  beforeAll(() => {
    traderClient1 = new MockTraderClientInterface({
      providerUrl: 'traderClient1',
      balance: { balance: { baseAmount: 1, quoteAmount: 1000 } },
      price: { amount: 10, asset: '' },
    });

    traderClient2 = new MockTraderClientInterface({
      providerUrl: 'traderClient2',
      balance: { balance: { baseAmount: 10, quoteAmount: 10 } },
      price: { amount: 100, asset: '' },
    });

    traderClient3 = new MockTraderClientInterface({
      providerUrl: 'traderClient3',
      balance: { balance: { baseAmount: 50, quoteAmount: 70 } },
      price: { amount: 400, asset: '' },
    });

    traderClient4 = new MockTraderClientInterface({
      providerUrl: 'traderClient4',
      balance: { balance: { baseAmount: 100, quoteAmount: 100 } },
      price: { amount: 1000, asset: '' },
    });
  });

  describe('best balance', () => {
    it('should select the balance with the greater quote amount (TradeType SELL)', async () => {
      const discoverer = tdexUtils.createDiscoverer(
        [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.SELL)),
        bestBalanceDiscovery
      );
      const bestOrders = await discoverer.discover({ asset: '', amount: 60 });
      assert.strictEqual(bestOrders.length, 1);
      assert.strictEqual(bestOrders[0].traderClient, traderClient1);
    });

    it('should select the balance with the greater base amount (TradeType BUY)', async () => {
      const discoverer = tdexUtils.createDiscoverer(
        [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.BUY)),
        bestBalanceDiscovery
      );
      const bestOrders = await discoverer.discover({ asset: '', amount: 12 });
      assert.strictEqual(bestOrders.length, 1);
      assert.strictEqual(bestOrders[0].traderClient, traderClient4);
    });
  });

  describe('best price', () => {
    it('should select the price with the greater amount (= the lowest price)', async () => {
      const discoverer = tdexUtils.createDiscoverer(
        [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.BUY)),
        bestPriceDiscovery
      );
      const bestOrders = await discoverer.discover({ asset: '', amount: 12 });
      assert.strictEqual(bestOrders.length, 1);
      assert.strictEqual(bestOrders[0].traderClient, traderClient4);
    });
  });

  describe('combine bestPrice and bestBalance', () => {
    it('should select the price with the greater amount (= the lowest price)', async () => {
      const discoverer = tdexUtils.createDiscoverer(
        [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.SELL)),
        combineDiscovery(bestPriceDiscovery, bestBalanceDiscovery)
      );
      const bestOrders = await discoverer.discover({ asset: '', amount: 60 });
      assert.strictEqual(bestOrders.length, 1);
      assert.strictEqual(bestOrders[0].traderClient, traderClient4);
    });
  });

  describe('discoverBestOrder', () => {
    beforeAll(() => {
      const spyCreateTraderClient = jest.spyOn(tdexUtils, 'createTraderClient');
      spyCreateTraderClient.mockImplementation((endpoint: string) => {
        if (endpoint === 'http://provider1') {
          return traderClient1;
        } else if (endpoint === 'http://provider2') {
          return traderClient2;
        } else if (endpoint === 'http://provider3') {
          return traderClient3;
        } else if (endpoint === 'http://provider4') {
          return traderClient4;
        } else {
          console.error('case should not happen');
          return traderClient1;
        }
      });
    });

    it('should return first possible order when sats <= 0', async () => {
      const discoverFunction = tdexUtils.discoverBestOrder(
        marketsLbtcUsdtSameFee,
        mockLbtcSendAsset,
        mockUsdtReceiveAsset
      );
      const bestOrder = await discoverFunction(0, mockLbtcSendAsset);
      assert.strictEqual(bestOrder.traderClient, traderClient1);
      // send asset === base asset, hence type is sell
      assert.strictEqual(bestOrder.type, 1);
    });

    it('should return best price order', async () => {
      // Change the strategy by spying on createDiscoverer
      const createDiscovererSpy = jest.spyOn(tdexUtils, 'createDiscoverer');
      createDiscovererSpy.mockReturnValue(
        new Discoverer(
          [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.BUY)),
          bestPriceDiscovery
        )
      );
      const discoverFunction = tdexUtils.discoverBestOrder(
        marketsLbtcUsdtSameFee,
        mockLbtcSendAsset,
        mockUsdtReceiveAsset
      );
      const bestOrder = await discoverFunction(10_000, mockLbtcSendAsset);
      assert.strictEqual(bestOrder.traderClient, traderClient4);
      assert.strictEqual(bestOrder.type, 0);
    });

    it('should return best balance order (TradeType BUY)', async () => {
      // Change the strategy by spying on createDiscoverer
      const createDiscovererSpy = jest.spyOn(tdexUtils, 'createDiscoverer');
      createDiscovererSpy.mockReturnValue(
        new Discoverer(
          [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.BUY)),
          bestBalanceDiscovery
        )
      );
      const discoverFunction = tdexUtils.discoverBestOrder(
        marketsLbtcUsdtSameFee,
        mockLbtcSendAsset,
        mockUsdtReceiveAsset
      );
      const bestOrder = await discoverFunction(80, mockLbtcSendAsset);
      assert.strictEqual(bestOrder.traderClient, traderClient4);
      assert.strictEqual(bestOrder.type, 0);
    });

    it('should return best balance order (TradeType SELL)', async () => {
      // Change the strategy by spying on createDiscoverer
      const createDiscovererSpy = jest.spyOn(tdexUtils, 'createDiscoverer');
      createDiscovererSpy.mockReturnValue(
        new Discoverer(
          [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.SELL)),
          bestBalanceDiscovery
        )
      );
      const discoverFunction = tdexUtils.discoverBestOrder(
        marketsLbtcUsdtSameFee,
        mockLbtcSendAsset,
        mockUsdtReceiveAsset
      );
      const bestOrder = await discoverFunction(20_000, mockLbtcSendAsset);
      assert.strictEqual(bestOrder.traderClient, traderClient1);
      assert.strictEqual(bestOrder.type, 1);
    });

    it('should combine bestPrice and bestBalance', async () => {
      // Change the strategy by spying on createDiscoverer
      const createDiscovererSpy = jest.spyOn(tdexUtils, 'createDiscoverer');
      createDiscovererSpy.mockReturnValue(
        new Discoverer(
          [traderClient1, traderClient2, traderClient3, traderClient4].map(makeOrder(TradeType.SELL)),
          combineDiscovery(bestPriceDiscovery, bestBalanceDiscovery)
        )
      );
      const discoverFunction = tdexUtils.discoverBestOrder(
        marketsLbtcUsdtSameFee,
        mockLbtcSendAsset,
        mockUsdtReceiveAsset
      );
      const bestOrder = await discoverFunction(20_000, mockLbtcSendAsset);
      assert.strictEqual(bestOrder.traderClient, traderClient4);
      assert.strictEqual(bestOrder.type, 1);
    });
  });
});
