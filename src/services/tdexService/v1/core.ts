import type { NetworkString } from '../../../utils/constants';

export interface CoreInterface {
  verbose?: Boolean;
  chain: NetworkString;
  providerUrl?: string;
  explorerUrl?: string;
}

export default class Core {
  public verbose?: Boolean = false;
  public chain: NetworkString = 'regtest';
  public providerUrl?: string;
  public explorerUrl?: string;

  constructor(data?: SafePick<Core>) {
    Object.assign(this, data);
  }
}

type NonMethodKeys<T> = ({
  [P in keyof T]: T[P] extends Function ? never : P;
} & { [x: string]: never })[keyof T];
type SafePick<T> = Pick<T, NonMethodKeys<T>>;
