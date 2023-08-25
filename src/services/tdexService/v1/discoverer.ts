import type { Discovery, DiscoveryOpts } from './discovery';
import type { TradeOrder } from './tradeCore';

export interface DiscovererInterface {
  orders: TradeOrder[];
  discovery: Discovery;

  discover(opts: DiscoveryOpts): Promise<TradeOrder[]>;
}

export class Discoverer implements DiscovererInterface {
  orders: TradeOrder[];
  discovery: Discovery;
  errorHandler?: (err: any) => Promise<void>;

  constructor(orders: TradeOrder[], discovery: Discovery, errorHandler?: (err: any) => Promise<void>) {
    this.orders = orders;
    this.discovery = discovery;
    this.errorHandler = errorHandler;
  }

  async discover(opts: DiscoveryOpts): Promise<TradeOrder[]> {
    return this.discovery(this.orders, opts, this.errorHandler);
  }
}
