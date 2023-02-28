import type { Transaction } from 'liquidjs-lib';

import { useSettingsStore } from '../store/settingsStore';
import type { Outpoint, ScriptDetails } from '../store/walletStore';
import { useWalletStore } from '../store/walletStore';

import type { NetworkString } from './constants';
import { LBTC_ASSET, LBTC_TICKER, LCAD_ASSET, USDT_ASSET } from './constants';

export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isLbtc(asset: string, network: NetworkString): boolean {
  return asset === LBTC_ASSET[network]?.assetHash;
}

export function isLbtcTicker(ticker: string): boolean {
  return ticker === LBTC_TICKER['liquid'] || ticker === LBTC_TICKER['testnet'];
}

export function isUsdt(asset: string, network: NetworkString): boolean {
  return asset === USDT_ASSET[network].assetHash;
}

export function isLcad(asset: string, network: NetworkString): boolean {
  return asset === LCAD_ASSET[network].assetHash;
}

export function getIndexAndIsChangeFromAddress(addr: ScriptDetails): {
  index: number;
  isChange: boolean;
} {
  if (!addr.derivationPath) throw new Error('need derivation path to be defined');
  const derivationPathSplitted = addr.derivationPath.split('/');
  return {
    index: parseInt(derivationPathSplitted[derivationPathSplitted.length - 1]),
    isChange: parseInt(derivationPathSplitted[derivationPathSplitted.length - 2]) !== 0,
  };
}

export function outpointToString(outpoint: Outpoint): string {
  return `${outpoint.txid}:${outpoint.vout}`;
}

export function outpointStrToOutpoint(outpointStr: string): Outpoint {
  const [txid, vout] = outpointStr.split(':');
  return { txid, vout: parseInt(vout) };
}

const emptyNonce: Buffer = Buffer.from('0x00', 'hex');

function bufferNotEmptyOrNull(buffer?: Buffer): boolean {
  return buffer != null && buffer.length > 0;
}

export function isConfidentialOutput({ rangeProof, surjectionProof, nonce }: any): boolean {
  return bufferNotEmptyOrNull(rangeProof) && bufferNotEmptyOrNull(surjectionProof) && nonce !== emptyNonce;
}

const reverseHex = (hex: string) => Buffer.from(hex, 'hex').reverse().toString('hex');

export async function makeURLwithBlinders(transaction: Transaction): Promise<string> {
  const webExplorerURL = useSettingsStore.getState().explorerLiquidUI;
  if (!webExplorerURL) throw new Error('web explorer url not found');
  const txid = transaction.getId();
  const blinders: string[] = [];
  for (let i = 0; i < transaction.outs.length; i++) {
    const output = transaction.outs[i];
    if (output.script.length === 0) continue;
    const data = await useWalletStore.getState().outputHistory[outpointToString({ txid, vout: i })];
    if (!data || !data.blindingData) continue;
    blinders.push(
      `${data.blindingData.value},${data.blindingData.asset},${reverseHex(
        data.blindingData.valueBlindingFactor
      )},${reverseHex(data.blindingData.assetBlindingFactor)}`
    );
  }
  return `${webExplorerURL}/tx/${txid}#blinded=${blinders.join(',')}`;
}

/**
 * Generates a random id of a fixed length.
 * @param length size of the string id.
 */
export function makeid(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
