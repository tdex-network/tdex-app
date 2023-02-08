import zkp from '@vulpemventures/secp256k1-zkp';
import axios from 'axios';
import type { BIP32Interface } from 'bip32';
import BIP32Factory from 'bip32';
import { mnemonicToSeedSync } from 'bip39';
import type { Payment } from 'bitcoinjs-lib';
import { address, AssetHash, confidential, networks, payments, Transaction } from 'liquidjs-lib';
import { confidentialValueToSatoshi } from 'liquidjs-lib/src/confidential';
import type { Output } from 'liquidjs-lib/src/transaction';
import moment from 'moment';
import { SLIP77Factory } from 'slip77';
import * as ecc from 'tiny-secp256k1';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { WsElectrumChainSource } from '../services/chainSource';
import { ElectrumWS } from '../services/ws/ws-electrs';
import { getBaseDerivationPath, LBTC_ASSET, LBTC_COINGECKOID } from '../utils/constants';
import type { Encrypted } from '../utils/crypto';
import { decrypt, encrypt } from '../utils/crypto';
import { toXpub } from '../utils/fromXpub';
import {
  fromSatoshi,
  getIndexAndIsChangeFromAddress,
  isConfidentialOutput,
  isLbtc,
  isLcad,
  isUsdt,
  outpointToString,
  sleep,
} from '../utils/helpers';

import { useAssetStore } from './assetStore';
import { useBitcoinStore } from './bitcoinStore';
import { storage } from './capacitorPersistentStorage';
import type { Currency } from './settingsStore';
import { useSettingsStore } from './settingsStore';

let coinSelect = require('coinselect');

const coinGeckoUrl = 'https://api.coingecko.com/api/v3';
export const axiosCoinGeckoObject = axios.create({ baseURL: coinGeckoUrl });
export type CoinGeckoPriceResult = Record<string, Record<Currency['ticker'], number>>;

export type UnblindingData = {
  value: number;
  asset: string;
  assetBlindingFactor: string;
  valueBlindingFactor: string;
};

export type Outpoint = {
  txid: string;
  vout: number;
};

export interface UnblindedOutput extends Outpoint {
  blindingData?: UnblindingData;
}

export enum TxType {
  SelfTransfer = 'SelfTransfer',
  Deposit = 'Deposit',
  DepositBtc = 'DepositBtc',
  Withdraw = 'Withdraw',
  Swap = 'Swap',
  Unknow = 'Unknow',
}

export interface TxHeuristic {
  amount: number; // amount > 0 = received & amount < 0 = sent
  asset: string;
  blockTime?: moment.Moment;
  blockHeight?: number;
  claimScript?: string;
  claimTxId?: string;
  fee: number;
  txid: string;
  type: TxType;
}

export interface CoinSelection {
  utxos: UnblindedOutput[];
  changeOutputs?: { asset: string; amount: number }[];
}

export interface ScriptDetails {
  confidentialAddress?: string;
  blindingPrivateKey: string;
  blindingPublicKey?: string;
  derivationPath?: string;
  publicKey?: string;
  script: string;
}

export interface Recipient {
  value: number;
  asset: string;
  address: string;
}

// assetHash => {
// satoshi amount computed from utxos,
// value is formatted value, either in fiat for fiat, or in favorite bitcoin unit for bitcoin
// counterValue determined by chosen favorite currency}
export type Balance = { sats: number; value: number; counterValue?: number };
export type Balances = Record<string, Balance>;

export interface TxDetails {
  height?: number;
  hex?: string;
}

interface WalletState {
  balances?: Balances;
  encryptedMnemonic?: Encrypted;
  isAuthorized: boolean;
  nextExternalIndex?: number;
  nextInternalIndex?: number;
  lockedOutpoints: string[];
  masterPublicKey: string;
  masterBlindingKey: string;
  scriptDetails: Record<string, ScriptDetails>; // script, scriptDetails
  txs: Record<string, TxDetails>; // txid, transaction
  totalBtc?: { sats: number; value: number; counterValue?: number };
  txsHeuristic?: Record<string, TxHeuristic>; // txid, TxHeuristic
  utxos: Record<string, UnblindedOutput>; // outpointStr, utxo
}

interface WalletActions {
  addScriptDetails: (scriptDetails: ScriptDetails) => void;
  changePin: (currentPIN: string, newPIN: string) => Promise<void>;
  clearScriptDetails: () => void;
  computeBalances: () => Promise<Balances>;
  computeHeuristicFromTx: (txDetails: TxDetails, assetHash?: string) => Promise<TxHeuristic | undefined>;
  computeHeuristicFromPegins: () => TxHeuristic[] | undefined;
  decryptMnemonic: (pin: string) => Promise<string>;
  deleteUtxo: (outpoint: Outpoint) => void;
  deriveBatch: (start: number, end: number, isInternal: boolean, updateCache?: boolean) => Promise<Buffer[]>;
  deriveBlindingKey: (script: Buffer) => { publicKey: Buffer; privateKey: Buffer };
  generateMasterKeys: (mnemonic: string) => void;
  getAllAddresses: () => Promise<string[]>;
  getNextAddress: (isInternal: boolean) => Promise<ScriptDetails>;
  lockOutpoint: (outpoint: Outpoint) => string;
  selectUtxos: (targets: Recipient[], lock: boolean) => Promise<CoinSelection>;
  setMnemonicEncrypted: (mnemonic: string, pin: string) => void;
  setIsAuthorized: (isAuthorized: boolean) => void;
  subscribeAllScripts: () => Promise<void>;
  subscribeBatch: (start: number, end: number, isInternal: boolean) => Promise<void>;
  sync: (gapLimit?: number) => Promise<void>;
  resetWalletStore: () => void;
  unblindUtxos: (outputs: Output[]) => Promise<(UnblindingData | Error)[]>;
  unlockOutpoint: (outpointStr: string) => void;
  unlockOutpoints: () => void;
  updateTxsAndUtxosFromScripts: (scripts: Buffer[], isInternal: boolean) => Promise<number>;
}

const initialState: WalletState = {
  scriptDetails: {},
  balances: undefined,
  encryptedMnemonic: undefined,
  isAuthorized: false,
  nextInternalIndex: undefined,
  nextExternalIndex: undefined,
  lockedOutpoints: [],
  masterPublicKey: '',
  masterBlindingKey: '',
  totalBtc: undefined,
  txs: {},
  txsHeuristic: undefined,
  utxos: {},
};

const GAP_LIMIT = 10;

const bip32 = BIP32Factory(ecc);
const slip77 = SLIP77Factory(ecc);

export const useWalletStore = create<WalletState & WalletActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        addScriptDetails: (scriptDetails: ScriptDetails) => {
          set(
            (state) => {
              if (!scriptDetails?.script) throw new Error('script is missing');
              if (Object.keys(state.scriptDetails).includes(scriptDetails.script)) return state;
              const { isChange, index } = getIndexAndIsChangeFromAddress(scriptDetails);
              return {
                scriptDetails: { [scriptDetails.script]: scriptDetails },
                nextInternalIndex: isChange ? index : state.nextInternalIndex,
                nextExternalIndex: isChange ? state.nextExternalIndex : index,
              };
            },
            false,
            'addScriptDetails'
          );
        },
        changePin: async (currentPIN: string, newPIN: string) => {
          const encryptedMnemonic = get().encryptedMnemonic;
          if (!encryptedMnemonic) throw new Error('No mnemonic found in wallet');
          const decryptedMnemonic = await decrypt(encryptedMnemonic, currentPIN);
          const newEncryptedMnemonic = await encrypt(decryptedMnemonic, newPIN);
          set({ encryptedMnemonic: newEncryptedMnemonic }, false, 'changePin');
        },
        clearScriptDetails: () => {
          set(
            {
              scriptDetails: {},
              nextInternalIndex: undefined,
              nextExternalIndex: undefined,
            },
            false,
            'clearScriptDetails'
          );
        },
        computeBalances: async () => {
          const network = useSettingsStore.getState().network;
          const currency = useSettingsStore.getState().currency;
          const lbtcDenomination = useSettingsStore.getState().lbtcDenomination;
          const utxos = get().utxos;
          let balances: Balances = {};
          for (const utxo of Object.values(utxos)) {
            if (utxo.blindingData) {
              const assetHash = utxo.blindingData?.asset;
              const assetAmount = utxo.blindingData?.value;
              balances = {
                [assetHash]: {
                  sats: (balances?.[assetHash]?.sats ?? 0) + assetAmount,
                  value: 0,
                  counterValue: 0,
                },
              };
              // Format amounts
              if (isLbtc(assetHash, network)) {
                balances[assetHash].value = fromSatoshi(
                  balances[assetHash].sats.toString(),
                  8,
                  lbtcDenomination
                ).toNumber();
              } else {
                balances[assetHash].value = fromSatoshi(balances[assetHash].sats.toString()).toNumber();
              }
            }
          }
          // Fetch fiat prices
          const { data, status } = await axiosCoinGeckoObject.get<CoinGeckoPriceResult>('/simple/price', {
            params: {
              ids: `${LBTC_COINGECKOID}`,
              vs_currencies: 'usd,cad,eur',
            },
          });
          if (status !== 200) {
            console.error('CoinGecko price fetching failed');
            return {};
          }
          let totalSats = 0;
          for (const [assetHash, balance] of Object.entries(balances)) {
            // compute fiat counter-value for lbtc
            if (isLbtc(assetHash, network)) {
              balance.counterValue =
                fromSatoshi(balance.sats.toString()).toNumber() * data[LBTC_COINGECKOID][currency.ticker];
              totalSats += balance.sats;
            }
            // compute lbtc counter-value for available fiat currencies (usd, cad)
            if (isUsdt(assetHash, network)) {
              balance.counterValue = fromSatoshi(balance.sats.toString()).toNumber() / data[LBTC_COINGECKOID]['usd'];
              totalSats += balance.counterValue;
            }
            if (isLcad(assetHash, network)) {
              balance.counterValue = fromSatoshi(balance.sats.toString()).toNumber() / data[LBTC_COINGECKOID]['cad'];
              totalSats += balance.counterValue;
            }
          }
          // If no balances, return LBTC balance of 0
          if (Object.keys(balances).length === 0) {
            balances = {
              [LBTC_ASSET[network].assetHash]: {
                sats: 0,
                value: 0,
                counterValue: 0,
              },
            };
          }
          set({ balances }, false, 'computeBalances/setBalances');
          set(
            {
              totalBtc: {
                sats: totalSats,
                counterValue:
                  fromSatoshi(totalSats.toString()).toNumber() * (data[LBTC_COINGECKOID]?.[currency.ticker] ?? 0),
                value: fromSatoshi(totalSats.toString(), 8, lbtcDenomination).toNumber(),
              },
            },
            false,
            'computeBalances/setTotalBtc'
          );
          return balances;
        },
        computeHeuristicFromTx: async (txDetails: TxDetails, assetHash = '') => {
          const txTypeFromAmount = (amount?: number): TxType => {
            if (amount === undefined) return TxType.Unknow;
            if (amount === 0) return TxType.SelfTransfer;
            if (amount > 0) return TxType.Deposit;
            return TxType.Withdraw;
          };
          const utxos = get().utxos;
          let transferAmount = 0;
          let fee = 0;
          const tx = Transaction.fromHex(txDetails.hex ?? '');
          for (const [index, output] of tx.outs.entries()) {
            if (output.script.length === 0) {
              fee = confidentialValueToSatoshi(output.value);
              continue;
            }
            const blindingData = utxos[outpointToString({ txid: tx.getId(), vout: index })]?.blindingData;
            if (!blindingData) continue;
            if (blindingData.asset === assetHash) {
              transferAmount += blindingData.value;
            }
          }
          for (const input of tx.ins) {
            const blindingData =
              utxos[
                outpointToString({
                  txid: Buffer.from(input.hash).reverse().toString('hex'),
                  vout: input.index,
                })
              ]?.blindingData;
            if (!blindingData) continue;
            if (blindingData.asset === assetHash) {
              transferAmount -= blindingData.value;
            }
          }
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          let blockTime: moment.Moment | undefined;
          if (txDetails.height) {
            const header = await chainSource.fetchBlockHeader(txDetails.height);
            blockTime = moment(header.timestamp * 1000); // TODO: check if * 1000 needed?
          }
          return {
            txid: tx.getId(),
            amount: transferAmount,
            asset: assetHash,
            fee,
            type: txTypeFromAmount(transferAmount),
            blockTime: blockTime,
          };
        },
        computeHeuristicFromPegins: () => {
          const pegins = useBitcoinStore.getState().pegins;
          const network = useSettingsStore.getState().network;
          const txs: TxHeuristic[] = [];
          for (const claimScript in pegins) {
            const pegin = pegins[claimScript];
            const depositUtxos = Object.values(pegin.depositUtxos ?? []);
            for (const utxo of depositUtxos) {
              txs.push({
                type: TxType.DepositBtc,
                fee: 0,
                txid: utxo.txid,
                claimTxId: utxo.claimTxId,
                asset: LBTC_ASSET[network].assetHash,
                amount: utxo.value ?? 0,
                blockTime: utxo.status?.block_time ? moment(utxo.status.block_time * 1000) : undefined,
                blockHeight: utxo.status?.block_height,
                claimScript: claimScript,
              });
            }
          }
          return txs;
        },
        decryptMnemonic: async (pin: string) => {
          const encryptedMnemonic = get().encryptedMnemonic;
          if (!encryptedMnemonic) throw new Error('No mnemonic found in wallet');
          return decrypt(encryptedMnemonic, pin);
        },
        deleteUtxo: (outpoint) => {
          set(
            (state) => {
              const newUtxosMap = { ...state.utxos };
              delete newUtxosMap[outpointToString(outpoint)];
              return { utxos: newUtxosMap };
            },
            false,
            'deleteUtxo'
          );
        },
        deriveBatch: async (start: number, end: number, isInternal: boolean, updateStore = true) => {
          // TODO: improve this
          const network = useSettingsStore.getState().network;
          const node = bip32.fromBase58(get().masterPublicKey);
          const chain = isInternal ? 1 : 0;
          let scriptDetails = get().scriptDetails;
          const scripts: Buffer[] = [];
          let p2wpkhPayment: Payment;
          let p2wpkhPayments: Payment[] = [];
          let child: BIP32Interface;
          let childs: BIP32Interface[] = [];
          for (let i = start; i < end; i++) {
            child = node.derive(chain).derive(i);
            childs.push(node.derive(chain).derive(i));
            p2wpkhPayment = payments.p2wpkh({ pubkey: child.publicKey, network: networks[network] });
            p2wpkhPayments.push(p2wpkhPayment);
            const script = p2wpkhPayment.output;
            if (!script) continue;
            scripts.push(script);
          }
          if (updateStore) {
            scripts.forEach((script, index) => {
              const { publicKey: blindingPublicKeyBuffer, privateKey: blindingPrivateKeyBuffer } =
                get().deriveBlindingKey(script);
              if (!blindingPrivateKeyBuffer) throw new Error('Could not derive blinding key');
              if (!p2wpkhPayments[index]?.address) throw new Error('Could not derive address');
              scriptDetails[script.toString('hex')] = {
                blindingPrivateKey: Buffer.from(blindingPrivateKeyBuffer).toString('hex'),
                blindingPublicKey: Buffer.from(blindingPublicKeyBuffer).toString('hex'),
                confidentialAddress: address.toConfidential(p2wpkhPayments[index].address!, blindingPublicKeyBuffer),
                derivationPath: `${getBaseDerivationPath(network)}/${isInternal ? '1' : '0'}/${start + index}`,
                script: script.toString('hex'),
                publicKey: childs[index].publicKey.toString('hex'),
              };
            });
            set({ scriptDetails }, false, 'deriveBatch');
          }
          return scripts;
        },
        deriveBlindingKey: (script: Buffer) => {
          const blindingKeyNode = slip77.fromMasterBlindingKey(get().masterBlindingKey);
          const derived = blindingKeyNode.derive(script);
          if (!derived.publicKey || !derived.privateKey) throw new Error('Could not derive blinding key');
          return { publicKey: derived.publicKey, privateKey: derived.privateKey };
        },
        generateMasterKeys: (mnemonic: string) => {
          const network = useSettingsStore.getState().network;
          const seed = mnemonicToSeedSync(mnemonic);
          const masterPublicKey = bip32.fromSeed(seed).derivePath(getBaseDerivationPath(network)).neutered().toBase58();
          // use xpub format for all networks to be more compatible with all other wallets that only uses xpub in Liquid (specter)
          set({ masterPublicKey: toXpub(masterPublicKey) }, false, 'setMasterPublicKey');
          const masterBlindingKey = slip77.fromSeed(seed).masterKey.toString('hex');
          set({ masterBlindingKey }, false, 'setMasterBlindingKey');
        },
        getAllAddresses: async () => {
          const nextExternalIndex = get().nextExternalIndex ?? 0;
          const nextInternalIndex = get().nextInternalIndex ?? 0;
          const network = useSettingsStore.getState().network;
          const externalScripts = Object.keys(await get().deriveBatch(0, nextExternalIndex, false, false));
          const internalScripts = Object.keys(await get().deriveBatch(0, nextInternalIndex, true, false));
          const scripts = [...externalScripts, ...internalScripts];
          return scripts.map((script) => {
            const { publicKey } = get().deriveBlindingKey(Buffer.from(script, 'hex'));
            return payments.p2wpkh({
              output: Buffer.from(script, 'hex'),
              network: networks[network],
              blindkey: publicKey,
            }).address!;
          });
        },
        getNextAddress: async (isInternal: boolean) => {
          const network = useSettingsStore.getState().network;
          const nextIndex = isInternal ? get().nextInternalIndex ?? 0 : get().nextExternalIndex ?? 0;
          const scriptDetails = await get().deriveBatch(nextIndex, nextIndex + 1, isInternal, true);
          const script = scriptDetails[0];
          if (!script) throw new Error('Could not derive script');
          await get().subscribeBatch(nextIndex, nextIndex + 1, isInternal);
          const { publicKey, privateKey } = get().deriveBlindingKey(script);
          const payment = payments.p2wpkh({
            output: script,
            network: networks[network],
            blindkey: publicKey,
          });
          if (!payment) throw new Error('Could not derive address');
          // Update next index
          if (isInternal) {
            set({ nextInternalIndex: nextIndex + 1 }, false, 'getNextAddress/internal');
          } else {
            set({ nextExternalIndex: nextIndex + 1 }, false, 'getNextAddress/external');
          }
          return {
            confidentialAddress: payment.confidentialAddress!,
            blindingPrivateKey: privateKey.toString('hex'),
            blindingPublicKey: publicKey.toString('hex'),
            publicKey: payment.pubkey?.toString('hex'),
            script: script.toString('hex'),
          };
        },
        lockOutpoint: ({ txid, vout }) => {
          const outpointStr = outpointToString({ txid, vout });
          set(() => ({ lockedOutpoints: [outpointStr] }), false, 'lockOutpoint');
          return outpointStr;
        },
        // Reset all except mnemonic / master keys
        resetWalletStore: () => {
          set(
            {
              scriptDetails: {},
              balances: undefined,
              nextInternalIndex: undefined,
              nextExternalIndex: undefined,
              lockedOutpoints: [],
              totalBtc: undefined,
              txs: {},
              txsHeuristic: undefined,
              utxos: {},
            },
            false,
            'resetWalletStore'
          );
        },
        selectUtxos: async (targets, lock = false) => {
          const allUtxos = Object.values(get().utxos);
          const onlyWithUnblindingData = allUtxos.filter((utxo) => utxo.blindingData);
          // accumulate targets with same asset
          targets = targets.reduce((acc, target) => {
            const existingTarget = acc.find((t) => t.asset === target.asset);
            if (existingTarget) {
              existingTarget.value += target.value;
            } else {
              acc.push(target);
            }
            return acc;
          }, [] as Recipient[]);
          //
          const selectedUtxos: UnblindedOutput[] = [];
          const changeOutputs: { asset: string; amount: number }[] = [];
          for (const target of targets) {
            const utxos = onlyWithUnblindingData.filter((utxo) => utxo.blindingData?.asset === target.asset);
            const { inputs, outputs } = coinSelect(
              utxos.map((utxo) => ({
                txId: utxo.txid,
                vout: utxo.vout,
                value: utxo.blindingData?.value,
              })),
              [{ address: 'fake', value: target.value }],
              0
            );
            if (inputs) {
              selectedUtxos.push(
                ...(inputs as { txId: string; vout: number }[]).map(
                  (input) =>
                    onlyWithUnblindingData.find(
                      (utxo) => utxo.txid === input.txId && utxo.vout === input.vout
                    ) as UnblindedOutput
                )
              );
            }
            if (outputs) {
              outputs
                .filter((output: any) => output.address !== 'fake') // only add change outputs
                .push(
                  ...(outputs as { value: number }[]).map((output) => ({
                    asset: target.asset,
                    amount: output.value,
                  }))
                );
            }
          }
          console.log('lock', lock);
          if (lock) {
            const lockedOutpoints = selectedUtxos.map((utxo) => get().lockOutpoint(utxo));
            // TODO: lock outpout
            // await sleep(60_000);
            lockedOutpoints.forEach((outpoints) => get().unlockOutpoint(outpoints));
          }
          return {
            utxos: selectedUtxos,
            changeOutputs,
          };
        },
        setMnemonicEncrypted: async (mnemonic, pin) => {
          const encryptedMnemonic = await encrypt(mnemonic, pin);
          set({ encryptedMnemonic }, false, 'setMnemonicEncrypted');
        },
        setIsAuthorized: (isAuthorized: boolean) => set({ isAuthorized }, false, 'setIsAuthorized'),
        subscribeAllScripts: async () => {
          let nextExternalIndex = get().nextExternalIndex ?? 0;
          let nextInternalIndex = get().nextInternalIndex ?? 0;
          const walletChains = [0, 1];
          for (const i of walletChains) {
            const isInternal = i === 1;
            const nextIndex = isInternal ? nextInternalIndex : nextExternalIndex;
            await get().subscribeBatch(0, nextIndex, isInternal);
          }
        },
        subscribeBatch: async (start: number, end: number, isInternal: boolean) => {
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          const scripts = await get().deriveBatch(start, end, isInternal, false);
          for (const script of scripts) {
            if (!script) continue;
            await chainSource.subscribeScriptStatus(script, async (_: string, status: string | null) => {
              if (status === null) return;
              await get().updateTxsAndUtxosFromScripts([script], isInternal);
              await get().computeBalances();
            });
          }
        },
        sync: async (gapLimit = GAP_LIMIT) => {
          try {
            let nextExternalIndex = get().nextExternalIndex ?? 0;
            let nextInternalIndex = get().nextInternalIndex ?? 0;
            const walletChains = [0, 1];
            for (const i of walletChains) {
              const isInternal = i === 1;
              let batchCount: number = isInternal ? nextInternalIndex : nextExternalIndex;
              let unusedScriptCounter = 0;
              while (unusedScriptCounter < gapLimit) {
                const scripts = await get().deriveBatch(batchCount, batchCount + gapLimit, isInternal, false);
                if (scripts.length === 0) break;
                unusedScriptCounter += await get().updateTxsAndUtxosFromScripts(scripts, isInternal);
                batchCount += gapLimit;
              }
            }
          } catch (e) {
            console.error('Error while syncing wallet', e);
          }
        },
        unblindUtxos: async (outputs) => {
          const scriptDetails = get().scriptDetails;
          const unblindingResults: (UnblindingData | Error)[] = [];
          for (const output of outputs) {
            try {
              const script = output.script.toString('hex');
              // if output is unconfidential, we don't need to unblind it
              if (!isConfidentialOutput(output)) {
                unblindingResults.push({
                  value: confidentialValueToSatoshi(output.value),
                  asset: AssetHash.fromBytes(output.asset).hex,
                  assetBlindingFactor: Buffer.alloc(32).toString('hex'),
                  valueBlindingFactor: Buffer.alloc(32).toString('hex'),
                });
                continue;
              }
              // if output is confidential, we need to unblind it
              const blindingPrivKey = scriptDetails[script]?.blindingPrivateKey;
              if (!blindingPrivKey) throw new Error('Could not find script blindingKey in cache');
              const zkpLib = await zkp();
              const lib = new confidential.Confidential(zkpLib);
              const unblinded = lib.unblindOutputWithKey(output, Buffer.from(blindingPrivKey, 'hex'));
              unblindingResults.push({
                value: parseInt(unblinded.value, 10),
                asset: AssetHash.fromBytes(unblinded.asset).hex,
                assetBlindingFactor: unblinded.assetBlindingFactor.toString('hex'),
                valueBlindingFactor: unblinded.valueBlindingFactor.toString('hex'),
              });
            } catch (e: unknown) {
              if (e instanceof Error) {
                unblindingResults.push(e);
              } else {
                unblindingResults.push(new Error('unable to unblind output (unknown error)'));
              }
            }
          }
          // update the asset registry
          const successfullyUnblinded = unblindingResults.filter((r): r is UnblindingData => !(r instanceof Error));
          const assetSet = new Set<string>(successfullyUnblinded.map((u) => u.asset));
          for (const asset of assetSet) {
            // check if we already have the asset details
            const assets = useAssetStore.getState().assets;
            if (assets[asset]) continue;
            useAssetStore.getState().fetchAndStoreAssetData(asset);
          }
          return unblindingResults;
        },
        unlockOutpoint: (outpointStr: string) => {
          set(
            (state) => ({
              lockedOutpoints: state.lockedOutpoints.filter((outpoint: string) => outpoint !== outpointStr),
            }),
            false,
            'unlockOutpoint'
          );
        },
        unlockOutpoints: () => {
          set({ lockedOutpoints: [] }, false, 'unlockOutpoints');
        },
        updateTxsAndUtxosFromScripts: async (scripts, isInternal) => {
          let newScripts: Buffer[] = [];
          scripts.forEach((script) => {
            // Only if we don't have the script already in store we process it
            if (Object.keys(get().scriptDetails[script.toString('hex')] ?? {}).length === 0) {
              newScripts.push(script);
            }
          });
          if (newScripts.length === 0) return 0;
          const historyTxsId: Set<string> = new Set();
          const txidHeight: Map<string, number | undefined> = new Map();
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          const histories = await chainSource.fetchHistories(newScripts);
          let unusedScriptCounter = 0;
          for (const [index, history] of histories.entries()) {
            if (history.length > 0) {
              unusedScriptCounter = 0; // reset counter
              for (const { tx_hash, height } of history) {
                historyTxsId.add(tx_hash);
                txidHeight.set(tx_hash, height);
              }
              // Update the next index
              if (isInternal) {
                set({ nextInternalIndex: index + 1 }, false, 'updateTxsAndUtxosFromScripts/internal');
              } else {
                set({ nextExternalIndex: index + 1 }, false, 'updateTxsAndUtxosFromScripts/external');
              }
            } else {
              unusedScriptCounter += 1;
            }
          }
          // fetch the transactions
          const txs = await chainSource.fetchTransactions(Array.from(historyTxsId));
          const txsObj = Object.fromEntries(txs.map(({ txid, hex }) => [txid, { hex, height: txidHeight.get(txid) }]));
          set((state) => ({ txs: { ...state.txs, ...txsObj } }), false, 'updateTxsAndUtxosFromScripts/txs');
          // Store used scripts
          if (isInternal) {
            let nextInternalIndex = get().nextInternalIndex ?? 0;
            await get().deriveBatch(0, nextInternalIndex, true, true);
          } else {
            let nextExternalIndex = get().nextExternalIndex ?? 0;
            await get().deriveBatch(0, nextExternalIndex, false, true);
          }
          // update the utxos
          const outpointsInInputs = new Set<string>();
          const walletOutputs = new Set<string>();
          const transactionsFromHex = Object.values(txsObj).map((tx) => Transaction.fromHex(tx.hex));
          for (const tx of transactionsFromHex) {
            for (const input of tx.ins) {
              outpointsInInputs.add(`${Buffer.from(input.hash).reverse().toString('hex')}:${input.index}`);
            }
            for (let i = 0; i < tx.outs.length; i++) {
              if (
                !Object.keys(get().scriptDetails).find((script) => Buffer.from(script, 'hex').equals(tx.outs[i].script))
              )
                continue;
              walletOutputs.add(`${tx.getId()}:${i}`);
            }
          }
          const utxosOutpoints = Array.from(walletOutputs)
            .filter((outpoint) => !outpointsInInputs.has(outpoint))
            .map((outpoint) => {
              const [txid, vout] = outpoint.split(':');
              return { txid, vout: Number(vout) };
            });
          for (const { txid, vout } of utxosOutpoints) {
            const tx = Transaction.fromHex(txsObj[txid].hex);
            const unblindedResults = await get().unblindUtxos([tx.outs[vout]]);
            if (unblindedResults[0] instanceof Error) {
              console.error('Error while unblinding utxos', unblindedResults[0]);
              continue;
            }
            set(
              (state) => ({
                utxos: {
                  ...state.utxos,
                  [outpointToString({ txid, vout })]: {
                    txid,
                    vout,
                    blindingData: unblindedResults[0] as UnblindingData,
                  },
                },
              }),
              false,
              'updateTxsAndUtxosFromScripts/utxos'
            );
          }
          return unusedScriptCounter;
        },
      }),
      {
        name: 'wallet',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'wallet' }
  )
);
