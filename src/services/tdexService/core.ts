import type { NetworkString } from '../../utils/constants';

export interface CoreInterface {
  verbose?: Boolean;
  chain: NetworkString;
  providerUrl?: string;
  explorerUrl?: string;
  protoVersion: 'v1' | 'v2';
}

export default class Core {
  public verbose?: Boolean = false;
  public chain: NetworkString = 'regtest';
  public providerUrl?: string;
  public explorerUrl?: string;
  public protoVersion: 'v1' | 'v2' = 'v2';

  constructor(data?: SafePick<Core>) {
    Object.assign(this, data);
  }
}

type NonMethodKeys<T> = ({
  [P in keyof T]: T[P] extends Function ? never : P;
} & { [x: string]: never })[keyof T];
type SafePick<T> = Pick<T, NonMethodKeys<T>>;
