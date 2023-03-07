import { crypto } from 'liquidjs-lib';
import type { ElectrumWS } from 'ws-electrumx-client';

export interface ChainSource {
  subscribeScriptStatus(script: Buffer, callback: (scripthash: string, status: string | null) => void): Promise<void>;

  unsubscribeScriptStatus(script: Buffer): Promise<void>;

  fetchHistories(scripts: Buffer[]): Promise<GetHistoryResponse[]>;

  fetchTransactions(txids: string[]): Promise<{ txid: string; hex: string }[]>;

  fetchBlockHeader(height: number): Promise<BlockHeader>;

  estimateFees(targetNumberBlocks: number): Promise<number>;

  broadcastTransaction(hex: string): Promise<string>;

  getRelayFee(): Promise<number>;
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
  private ws: ElectrumWS;

  constructor(ws: ElectrumWS) {
    this.ws = ws;
  }

  async fetchTransactions(txids: string[]): Promise<{ txid: string; hex: string }[]> {
    const responses = await this.ws.batchRequest<string[]>(
      ...txids.map((txid) => ({ method: GetTransactionMethod, params: [txid] }))
    );
    return responses.map((hex, i) => ({ txid: txids[i], hex }));
  }

  async unsubscribeScriptStatus(script: Buffer): Promise<void> {
    await this.ws.unsubscribe(SubscribeStatusMethod, toScriptHash(script)).catch();
  }

  async subscribeScriptStatus(
    script: Buffer,
    callback: (scripthash: string, status: string | null) => void
  ): Promise<void> {
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
    const scriptsHashes = scripts.map((s) => toScriptHash(s));
    return await this.ws.batchRequest<GetHistoryResponse[]>(
      ...scriptsHashes.map((s) => ({ method: GetHistoryMethod, params: [s] }))
    );
  }

  async fetchBlockHeader(height: number): Promise<BlockHeader> {
    const hex = await this.ws.request<string>(GetBlockHeader, height);
    return deserializeBlockHeader(hex);
  }

  async estimateFees(targetNumberBlocks: number): Promise<number> {
    return await this.ws.request<number>(EstimateFee, targetNumberBlocks);
  }

  async broadcastTransaction(hex: string): Promise<string> {
    return this.ws.request<string>(BroadcastTransaction, hex);
  }

  async getRelayFee(): Promise<number> {
    return this.ws.request<number>(GetRelayFeeMethod);
  }
}

function toScriptHash(script: Buffer): string {
  return crypto.sha256(script).reverse().toString('hex');
}
