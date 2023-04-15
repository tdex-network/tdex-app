import { crypto } from 'liquidjs-lib';
import { ElectrumWS } from 'ws-electrumx-client';

import { useSettingsStore } from '../store/settingsStore';

export interface ChainSource {
  subscribeScriptStatus(
    script: Buffer,
    callback: (scripthash: string, status: string | null) => Promise<void>
  ): Promise<void>;

  unsubscribeScriptStatus(script: Buffer): Promise<void>;

  fetchHistories(scripts: Buffer[]): Promise<GetHistoryResponse[]>;

  fetchTransactions(txids: string[]): Promise<{ txid: string; hex: string }[]>;

  fetchBlockHeader(height: number): Promise<BlockHeader>;

  estimateFees(targetNumberBlocks: number): Promise<number>;

  broadcastTransaction(hex: string): Promise<string>;

  getRelayFee(): Promise<number>;

  renewInstance(): void;
}

export type GetHistoryResponse = {
  tx_hash: string;
  height: number;
}[];

export type ListUnspentResponse = {
  tx_hash: string;
  tx_pos: number;
  height: number; // if 0 = unconfirmed
}[];

export interface BlockHeader {
  version: number;
  previousBlockHash: string;
  merkleRoot: string;
  timestamp: number;
  height: number;
}

const DYNAFED_HF_MASK = 2147483648;

export function deserializeBlockHeader(hex: string): BlockHeader {
  const buffer = Buffer.from(hex, 'hex');
  let offset = 0;
  let version = buffer.readUInt32LE(offset);
  offset += 4;
  const isDyna = (version & DYNAFED_HF_MASK) !== 0;
  if (isDyna) {
    version = version & ~DYNAFED_HF_MASK;
  }
  const previousBlockHash = buffer
    .subarray(offset, offset + 32)
    .reverse()
    .toString('hex');
  offset += 32;
  const merkleRoot = buffer.subarray(offset, offset + 32).toString('hex');
  offset += 32;
  const timestamp = buffer.readUInt32LE(offset);
  offset += 4;
  const height = buffer.readUInt32LE(offset);
  offset += 4;
  return {
    version,
    previousBlockHash,
    merkleRoot,
    timestamp,
    height,
  };
}

const BroadcastTransaction = 'blockchain.transaction.broadcast'; // returns txid
const EstimateFee = 'blockchain.estimatefee'; // returns fee rate in sats/kBytes
const GetBlockHeader = 'blockchain.block.header'; // returns block header as hex string
const GetHistoryMethod = 'blockchain.scripthash.get_history';
const GetTransactionMethod = 'blockchain.transaction.get';
const SubscribeStatusMethod = 'blockchain.scripthash'; // ElectrumWS automatically adds '.subscribe'
const GetRelayFeeMethod = 'blockchain.relayfee';

export class WsElectrumChainSource implements ChainSource {
  private ws?: ElectrumWS;

  constructor() {
    if (!this.ws) {
      const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
      this.ws = new ElectrumWS(websocketExplorerURL);
    }
  }

  async fetchTransactions(txids: string[]): Promise<{ txid: string; hex: string }[]> {
    if (!this.ws) return [];
    const responses = await this.ws.batchRequest<string[]>(
      ...txids.map((txid) => ({ method: GetTransactionMethod, params: [txid] }))
    );
    return responses.map((hex, i) => ({ txid: txids[i], hex }));
  }

  async unsubscribeScriptStatus(script: Buffer): Promise<void> {
    if (!this.ws) return;
    await this.ws.unsubscribe(SubscribeStatusMethod, toScriptHash(script)).catch();
  }

  async subscribeScriptStatus(
    script: Buffer,
    callback: (scripthash: string, status: string | null) => Promise<void>
  ): Promise<void> {
    if (!this.ws) return;
    const scriptHash = toScriptHash(script);
    await this.ws.subscribe(
      SubscribeStatusMethod,
      (scripthash: unknown, status: unknown) => {
        if (scripthash === scriptHash) {
          callback(scripthash, status as string | null);
        }
      },
      scriptHash
    );
  }

  async fetchHistories(scripts: Buffer[]): Promise<GetHistoryResponse[]> {
    if (!this.ws) return [];
    const scriptsHashes = scripts.map((s) => toScriptHash(s));
    return await this.ws.batchRequest<GetHistoryResponse[]>(
      ...scriptsHashes.map((s) => ({ method: GetHistoryMethod, params: [s] }))
    );
  }

  async fetchBlockHeader(height: number): Promise<BlockHeader> {
    if (!this.ws) return {} as BlockHeader;
    const hex = await this.ws.request<string>(GetBlockHeader, height);
    return deserializeBlockHeader(hex);
  }

  async estimateFees(targetNumberBlocks: number): Promise<number> {
    if (!this.ws) return 0;
    return await this.ws.request<number>(EstimateFee, targetNumberBlocks);
  }

  async broadcastTransaction(hex: string): Promise<string> {
    if (!this.ws) return '';
    return this.ws.request<string>(BroadcastTransaction, hex);
  }

  async getRelayFee(): Promise<number> {
    if (!this.ws) return 0;
    return this.ws.request<number>(GetRelayFeeMethod);
  }

  renewInstance(): void {
    const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
    this.ws = new ElectrumWS(websocketExplorerURL);
  }
}

export const chainSource = new WsElectrumChainSource();

function toScriptHash(script: Buffer): string {
  return crypto.sha256(script).reverse().toString('hex');
}
