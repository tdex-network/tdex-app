export interface UnblindTxsRequestParams {
  confidentialAddress: string;
  privateBlindingKey: Array<string>;
  explorerUrl: string;
}
