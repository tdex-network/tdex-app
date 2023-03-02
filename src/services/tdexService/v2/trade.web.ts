import type { Tdexv2ContentType } from '../../../api-spec/openapi/swagger/v2/transport/data-contracts';

import { TraderClient } from './client.web';
import type TraderClientInterface from './clientInterface';
import type { TradeInterface, TradeOpts } from './tradeCore';
import { TradeCore } from './tradeCore';

export type ConnectionOpts = {
  torProxyEndpoint?: string;
  clientTypePriority?: Tdexv2ContentType[];
};

export class Trade extends TradeCore implements TradeInterface {
  constructor(args: TradeOpts, torProxyEndpoint?: string, client?: TraderClientInterface) {
    super(args, (provider: string) => client || new TraderClient(provider, torProxyEndpoint));
  }
}
