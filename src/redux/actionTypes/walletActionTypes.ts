export interface BalanceInterface {
  asset: string;
  amount: number;
  ticker: string;
  name: string;
  precision: number;
  coinGeckoID?: string;
}
