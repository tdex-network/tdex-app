import type { Tdexv1ContentType } from '../../../api-spec/openapi/swagger/v1/transport/data-contracts';

import { TraderClient } from './client.web';
import type TraderClientInterface from './clientInterface';
import type { TradeInterface, TradeOpts } from './tradeCore';
import { TradeCore } from './tradeCore';

export type ConnectionOpts = {
  torProxyEndpoint?: string;
  clientTypePriority?: Tdexv1ContentType[];
};

export class Trade extends TradeCore implements TradeInterface {
  constructor(args: TradeOpts, torProxyEndpoint?: string, client?: TraderClientInterface) {
    super(args, (provider: string) => client || new TraderClient(provider, torProxyEndpoint));
  }
}
