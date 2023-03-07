import zkp from '@vulpemventures/secp256k1-zkp';
import BIP32Factory from 'bip32';
import { mnemonicToSeedSync } from 'bip39';
import type { UpdaterInput } from 'liquidjs-lib';
import { address, AssetHash, confidential, networks, payments, Transaction } from 'liquidjs-lib';
import { confidentialValueToSatoshi } from 'liquidjs-lib/src/confidential';
import type { Output } from 'liquidjs-lib/src/transaction';
import moment from 'moment';
import { SLIP77Factory } from 'slip77';
import * as ecc from 'tiny-secp256k1';
import { ElectrumWS } from 'ws-electrumx-client';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { WsElectrumChainSource } from '../services/chainSource';
import { getBaseDerivationPath, LBTC_ASSET, LBTC_COINGECKOID } from '../utils/constants';
import type { Encrypted } from '../utils/crypto';
import { decrypt, encrypt } from '../utils/crypto';
import { toXpub } from '../utils/fromXpub';
import {
  getIndexAndIsChangeFromAddress,
  isConfidentialOutput,
  isLbtc,
  isLcad,
  isUsdt,
  outpointStrToOutpoint,
  outpointToString,
} from '../utils/helpers';
import { fromSatoshi, toSatoshi } from '../utils/unitConversion';

import { useAssetStore } from './assetStore';
import { useBitcoinStore } from './bitcoinStore';
import { storage } from './capacitorPersistentStorage';
import { useRateStore } from './rateStore';
import { useSettingsStore } from './settingsStore';

let coinSelect = require('coinselect');

export type PubKeyWithRelativeDerivationPath = {
  publicKey: Buffer;
  derivationPath: string;
};

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
  amount?: number; // amt > 0 = received, amt < 0 = sent, amt == 0 = self, amt == undefined = swap
  asset?: string; // asset is undefined if it's a swap
  blockTime?: moment.Moment;
  blockHeight?: number;
  claimScript?: string;
  claimTxId?: string;
  confidentialAddress?: string;
  fee: number;
  swapReceived?: { asset: string; amount: number };
  swapSent?: { asset: string; amount: number };
  txid: string;
  type: TxType;
}

export interface CoinSelection {
  utxos: UnblindedOutput[];
  changeOutputs?: { asset: string; amount: number }[];
}

export interface CoinSelectionForTrade {
  witnessUtxos: Record<string, Output>;
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
export type Balance = { sats: number; value: number; counterValue?: string };
export type Balances = Record<string, Balance>;

export interface TxDetails {
  height: number;
  hex: string;
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
  outputHistory: Record<string, UnblindedOutput>; // outpointStr, utxo
  scriptDetails: Record<string, ScriptDetails>; // script, scriptDetails
  txs: Record<string, TxDetails>; // txid, transaction
  totalBtc?: { sats: number; value: number; counterValue?: string };
  txsHeuristic?: Record<string, TxHeuristic>; // txid, TxHeuristic
}

interface WalletActions {
  addScriptDetails: (scriptDetails: ScriptDetails) => void;
  changePin: (currentPIN: string, newPIN: string) => Promise<void>;
  computeBalances: () => Promise<void>;
  computeUtxosFromTxs: () => UnblindedOutput[];
  computeHeuristicFromTx: (txDetails: TxDetails, assetHash?: string) => Promise<TxHeuristic | undefined>;
  computeHeuristicFromPegins: () => TxHeuristic[] | undefined;
  createP2PWKHScript: ({ publicKey, derivationPath }: PubKeyWithRelativeDerivationPath) => [string, ScriptDetails];
  decryptMnemonic: (pin: string) => Promise<string>;
  deriveBatchPublicKeys: (start: number, end: number, isInternal: boolean) => PubKeyWithRelativeDerivationPath[];
  deriveBlindingKey: (script: Buffer) => { publicKey: Buffer; privateKey: Buffer };
  generateMasterKeys: (mnemonic: string) => void;
  getNextAddress: (isInternal: boolean, dryRun?: boolean) => Promise<ScriptDetails>;
  getWitnessUtxo: (txid: string, vout: number) => UpdaterInput['witnessUtxo'];
  lockOutpoint: (outpoint: Outpoint) => string;
  selectUtxos: (targets: Recipient[], lock: boolean) => Promise<CoinSelection>;
  setIsAuthorized: (isAuthorized: boolean) => void;
  setMnemonicEncrypted: (mnemonic: string, pin: string) => Promise<void>;
  setOutputs: () => void;
  subscribeScript: (script: Buffer) => Promise<void>;
  subscribeAllScripts: () => Promise<void>;
  sync: (gapLimit?: number) => Promise<{ nextInternalIndex: number; nextExternalIndex: number }>;
  resetWalletStore: () => void;
  resetWalletForRestoration: () => void;
  unblindUtxos: (outputs: Output[]) => Promise<(UnblindingData | Error)[]>;
  unlockOutpoint: (outpointStr: string) => void;
  unlockOutpoints: () => void;
}

const initialState: WalletState = {
  balances: undefined,
  encryptedMnemonic: undefined,
  isAuthorized: false,
  lockedOutpoints: [],
  nextInternalIndex: undefined,
  nextExternalIndex: undefined,
  masterPublicKey: '',
  masterBlindingKey: '',
  outputHistory: {},
  scriptDetails: {},
  totalBtc: undefined,
  txs: {},
  txsHeuristic: undefined,
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
        createP2PWKHScript({ publicKey, derivationPath }: PubKeyWithRelativeDerivationPath): [string, ScriptDetails] {
          const network = useSettingsStore.getState().network;
          const p2wpkhPayment = payments.p2wpkh({ pubkey: publicKey, network: networks[network] });
          const script = p2wpkhPayment.output;
          if (!script) throw new Error('Could not derive script');
          const { publicKey: blindingPublicKeyBuffer, privateKey: blindingPrivateKeyBuffer } =
            get().deriveBlindingKey(script);
          if (!blindingPrivateKeyBuffer) throw new Error('Could not derive blinding key');
          return [
            script.toString('hex'),
            {
              derivationPath,
              publicKey: publicKey.toString('hex'),
              script: script.toString('hex'),
              blindingPrivateKey: blindingPrivateKeyBuffer.toString('hex'),
              blindingPublicKey: blindingPublicKeyBuffer.toString('hex'),
              confidentialAddress: address.toConfidential(p2wpkhPayment.address!, blindingPublicKeyBuffer),
            },
          ];
        },
        computeBalances: async () => {
          const network = useSettingsStore.getState().network;
          const currency = useSettingsStore.getState().currency;
          const lbtcUnit = useSettingsStore.getState().lbtcUnit;
          const zeroLbtcBalance = {
            [LBTC_ASSET[network].assetHash]: {
              sats: 0,
              value: 0,
              counterValue: '0',
            },
          };
          const utxos = get().computeUtxosFromTxs();
          let balances: Balances = {};
          for (const utxo of utxos) {
            if (utxo?.blindingData) {
              const assetHash = utxo.blindingData?.asset;
              const assetAmount = utxo.blindingData?.value;
              balances = {
                ...balances,
                [assetHash]: {
                  sats: (balances?.[assetHash]?.sats ?? 0) + assetAmount,
                  value: 0,
                  counterValue: '0',
                },
              };
              // Format amounts
              if (isLbtc(assetHash, network)) {
                balances[assetHash].value = fromSatoshi(balances[assetHash].sats, 8, lbtcUnit);
              } else {
                balances[assetHash].value = fromSatoshi(balances[assetHash].sats);
              }
            }
          }
          let totalSats = 0;
          let totalCounterValue = '0';
          await useRateStore.getState().fetchFiatRates();
          const rates = await useRateStore.getState().rates;
          if (rates) {
            for (const [assetHash, balance] of Object.entries(balances)) {
              // compute fiat counter-value for lbtc
              if (isLbtc(assetHash, network)) {
                const val = fromSatoshi(balance.sats) * rates[LBTC_COINGECKOID][currency.ticker];
                balance.counterValue = val.toFixed(2);
                totalSats += balance.sats;
              }
              // compute lbtc counter-value for available fiat currencies (usd, cad)
              if (isUsdt(assetHash, network)) {
                const val = fromSatoshi(balance.sats) / rates[LBTC_COINGECKOID]['usd'];
                balance.counterValue = val.toFixed(2);
                totalSats += val;
              }
              if (isLcad(assetHash, network)) {
                const val = fromSatoshi(balance.sats) / rates[LBTC_COINGECKOID]['cad'];
                balance.counterValue = val.toFixed(2);
                totalSats += val;
              }
            }
            //
            const val = fromSatoshi(totalSats) * (rates[LBTC_COINGECKOID]?.[currency.ticker] ?? 0);
            totalCounterValue = val.toFixed(2);
          }
          // If no balances, return LBTC balance of 0
          if (Object.keys(balances).length === 0) balances = zeroLbtcBalance;
          set({ balances }, false, 'computeBalances/setBalances');
          set(
            {
              totalBtc: {
                sats: Math.round(totalSats),
                counterValue: totalCounterValue,
                value: fromSatoshi(Math.round(totalSats), 8, lbtcUnit),
              },
            },
            false,
            'computeBalances/setTotalBtc'
          );
        },
        computeUtxosFromTxs: () => {
          const txs = get().txs;
          const outpointsInInputs = new Set<string>();
          const walletOutputs = new Set<string>();
          const transactionsFromHex = Object.values(txs).map((tx) => Transaction.fromHex(tx.hex));
          for (const tx of transactionsFromHex) {
            for (const input of tx.ins) {
              outpointsInInputs.add(`${Buffer.from(input.hash).reverse().toString('hex')}:${input.index}`);
            }
            for (let i = 0; i < tx.outs.length; i++) {
              if (
                !Object.keys(get().scriptDetails).find((script) => Buffer.from(script, 'hex').equals(tx.outs[i].script))
              ) {
                continue;
              }
              walletOutputs.add(`${tx.getId()}:${i}`);
            }
          }
          const utxosOutpoints = Array.from(walletOutputs)
            .filter((outpointStr) => !outpointsInInputs.has(outpointStr))
            .filter((outpointStr) => !get().lockedOutpoints.find((locked) => locked === outpointStr))
            .map((outpointStr) => outpointStrToOutpoint(outpointStr));
          //
          return utxosOutpoints.map((outpoint) => {
            const outpointStr = outpointToString(outpoint);
            const unblindedOutput = get().outputHistory[outpointStr];
            if (!unblindedOutput) console.error(`Output ${outpointStr} is missing`);
            return unblindedOutput;
          });
        },
        computeHeuristicFromTx: async (txDetails) => {
          const network = useSettingsStore.getState().network;
          let isSwap = false;
          const txTypeFromAmount = (amount?: number): TxType => {
            if (isSwap) return TxType.Swap;
            if (inputAssets.length === 0) {
              return TxType.Deposit;
            }
            if (inputAssets.length >= 1 && outputAssets.length >= 1) {
              if (amount === 0) {
                return TxType.SelfTransfer;
              } else {
                return TxType.Withdraw;
              }
            }
            return TxType.Unknow;
          };
          const outputHistory = get().outputHistory;
          let assetHash: string | undefined;
          let amount: number | undefined;
          let swapReceived;
          let swapSent;
          let inputAssets = [];
          let outputAssets = [];
          let script = '';
          let fee = 0;
          const tx = Transaction.fromHex(txDetails.hex ?? '');

          // process outputs
          for (const [index, output] of tx.outs.entries()) {
            if (output.script.length === 0) {
              fee = confidentialValueToSatoshi(output.value);
              continue;
            }
            const blindingData = outputHistory[outpointToString({ txid: tx.getId(), vout: index })]?.blindingData;
            if (!blindingData) continue;
            script = Buffer.from(output.script).toString('hex');
            outputAssets.push({ asset: blindingData.asset, amount: blindingData.value });
          }

          // process inputs
          for (const input of tx.ins) {
            const blindingData =
              outputHistory[`${Buffer.from(input.hash).reverse().toString('hex')}:${input.index}`]?.blindingData;
            if (!blindingData) continue;
            inputAssets.push({ asset: blindingData.asset, amount: blindingData.value });
          }

          // If more than 1 output, check that one output asset is not present in the inputs to identify swaps
          if (outputAssets.length > 1) {
            for (const { asset, amount } of outputAssets) {
              if (!inputAssets.map((i) => i.asset).includes(asset)) {
                swapReceived = { asset, amount };
                isSwap = true;
              } else {
                const totalInputAmount = inputAssets.reduce((acc, i) => (i.asset === asset ? acc + i.amount : acc), 0);
                const totalOutputAmount = outputAssets.reduce(
                  (acc, i) => (i.asset === asset ? acc + i.amount : acc),
                  0
                );
                swapSent = { asset, amount: totalInputAmount - totalOutputAmount };
              }
            }
          }

          // Deposit
          if (inputAssets.length === 0) {
            assetHash = outputAssets[0].asset;
            amount = outputAssets.reduce((acc, i) => (i.asset === assetHash ? acc + i.amount : acc), 0);
          } else if (!isSwap && inputAssets.length >= 1 && outputAssets.length >= 1) {
            // Withdraw or SelfTransfer
            assetHash = inputAssets[0].asset;
            const totalInputAmount = inputAssets.reduce((acc, i) => (i.asset === assetHash ? acc + i.amount : acc), 0);
            const totalOutputAmount = outputAssets.reduce(
              (acc, i) => (i.asset === assetHash ? acc + i.amount : acc),
              0
            );
            amount = totalOutputAmount - totalInputAmount;
          }

          // fetch block time
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          let blockTime: moment.Moment | undefined;
          if (txDetails.height) {
            const header = await chainSource.fetchBlockHeader(txDetails.height);
            blockTime = moment(header.timestamp * 1000);
          }

          // compute deposit or recipient confidential address
          const master = slip77.fromMasterBlindingKey(get().masterBlindingKey);
          const derived = master.derive(script);
          const confidentialAddress = payments.p2wpkh({
            output: Buffer.from(script, 'hex'),
            blindkey: derived.publicKey,
            network: networks[network],
          }).confidentialAddress;

          // if amount is negative, it's a withdrawal, so we add the fee
          amount = amount !== undefined ? (amount < 0 ? amount + fee : amount) : undefined;

          return {
            amount,
            asset: assetHash,
            blockTime: blockTime,
            blockHeight: txDetails.height,
            confidentialAddress,
            fee,
            swapReceived,
            swapSent,
            type: txTypeFromAmount(amount),
            txid: tx.getId(),
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
                asset: LBTC_ASSET[network].assetHash,
                amount: utxo.value ?? 0,
                blockTime: utxo.status?.block_time ? moment(utxo.status.block_time * 1000) : undefined,
                blockHeight: utxo.status?.block_height,
                claimScript: claimScript,
                claimTxId: utxo.claimTxId,
                fee: 0,
                txid: utxo.txid,
                type: TxType.DepositBtc,
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
        deriveBatchPublicKeys: (start, end, isInternal) => {
          const network = useSettingsStore.getState().network;
          const node = bip32.fromBase58(get().masterPublicKey);
          const chain = isInternal ? 1 : 0;
          const results: PubKeyWithRelativeDerivationPath[] = [];
          for (let i = start; i < end; i++) {
            const child = node.derive(chain).derive(i);
            if (!child.publicKey) throw new Error('Could not derive public key');
            results.push({
              publicKey: child.publicKey,
              derivationPath: `${getBaseDerivationPath(network)}/${chain}/${i}`,
            });
          }
          return results;
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
        getNextAddress: async (isInternal: boolean, dryRun = false) => {
          const nextIndex = isInternal ? get().nextInternalIndex ?? 0 : get().nextExternalIndex ?? 0;
          const pubKey = get().deriveBatchPublicKeys(nextIndex, nextIndex + 1, isInternal);
          const scriptDetails = get().createP2PWKHScript({
            publicKey: pubKey[0].publicKey,
            derivationPath: pubKey[0].derivationPath,
          });
          if (!dryRun) {
            await get().subscribeScript(Buffer.from(scriptDetails[0], 'hex'));
            // increment the account details last used index & persist the new script details
            set({ [isInternal ? 'nextInternalIndex' : 'nextExternalIndex']: nextIndex + 1 }, false, 'setNextIndex');
            set(
              (state) => ({
                scriptDetails: {
                  ...state.scriptDetails,
                  [scriptDetails[0]]: scriptDetails[1],
                },
              }),
              false,
              'setScriptDetails'
            );
          }
          return scriptDetails[1];
        },
        getWitnessUtxo: (txid: string, vout: number) => {
          const txDetails = get().txs[txid];
          if (!txDetails || !txDetails.hex) return undefined;
          return Transaction.fromHex(txDetails.hex).outs[vout];
        },
        lockOutpoint: ({ txid, vout }) => {
          const outpointStr = outpointToString({ txid, vout });
          set(() => ({ lockedOutpoints: [outpointStr] }), false, 'lockOutpoint');
          return outpointStr;
        },
        // Reset all except mnemonic / master keys
        resetWalletForRestoration: () => {
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
              outputHistory: {},
            },
            false,
            'resetWalletForRestoration'
          );
        },
        resetWalletStore: () => {
          set(initialState, false, 'resetWalletStore');
        },
        // Coin selection
        selectUtxos: async (targets, lock = false) => {
          const assets = useAssetStore.getState().assets;
          const lbtcUnit = useSettingsStore.getState().lbtcUnit;
          const availableUtxos = get().computeUtxosFromTxs();
          const onlyWithUnblindingData = availableUtxos.filter((utxo) => utxo.blindingData);
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
              [{ address: 'fake', value: toSatoshi(target.value, assets[target.asset]?.precision, lbtcUnit) }],
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
              changeOutputs.push(
                ...outputs
                  .filter((output: any) => output.address === undefined) // only add change outputs
                  .map((output: { value: number }) => ({
                    asset: target.asset,
                    amount: output.value,
                  }))
              );
            }
          }
          if (lock) {
            const lockedOutpoints = selectedUtxos.map((utxo) => get().lockOutpoint(utxo));
            setTimeout(() => {
              lockedOutpoints.forEach((outpoints) => get().unlockOutpoint(outpoints));
            }, 60_000);
          }
          return {
            utxos: selectedUtxos,
            changeOutputs,
          };
        },
        setIsAuthorized: (isAuthorized: boolean) => set({ isAuthorized }, false, 'setIsAuthorized'),
        setMnemonicEncrypted: async (mnemonic, pin) => {
          const encryptedMnemonic = await encrypt(mnemonic, pin);
          set({ encryptedMnemonic }, false, 'setMnemonicEncrypted');
        },
        setOutputs: async () => {
          const txsObj = get().txs;
          let outputHistory: Record<string, UnblindedOutput> = {};
          for (const [txid, { hex }] of Object.entries(txsObj)) {
            const tx = Transaction.fromHex(hex);
            const unblindedResults = await get().unblindUtxos(tx.outs);
            for (const [vout, unblinded] of unblindedResults.entries()) {
              if (unblinded instanceof Error) {
                console.debug('Error while unblinding utxos', unblinded);
                continue;
              }
              outputHistory = {
                ...outputHistory,
                [outpointToString({ txid, vout })]: {
                  txid,
                  vout,
                  blindingData: unblinded,
                },
              };
            }
          }
          set(
            (state) => ({
              outputHistory: {
                ...state.outputHistory,
                ...outputHistory,
              },
            }),
            false,
            'setOutputs'
          );
        },
        subscribeScript: async (script) => {
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          await chainSource.subscribeScriptStatus(script, async (_: string, __: string | null) => {
            const history = await chainSource.fetchHistories([script]);
            const historyTxId = history[0].map(({ tx_hash }) => tx_hash);
            const txs = await chainSource.fetchTransactions(historyTxId);
            const txsObj = Object.fromEntries(txs.map(({ txid, hex }) => [txid, { hex }]));
            const historyObj = Object.fromEntries(history[0].map(({ tx_hash, height }) => [tx_hash, { height }]));
            const txsAndHistory = Object.fromEntries(
              Object.entries(txsObj).map(([txid, tx]) => [txid, { ...tx, ...historyObj[txid] }])
            );
            set((state) => ({ txs: { ...state.txs, ...txsAndHistory } }), false, 'subscribeScript/txs');
            await get().setOutputs();
            await get().computeBalances();
          });
        },
        subscribeAllScripts: async () => {
          const scripts = Object.keys(get().scriptDetails).map((s) => Buffer.from(s, 'hex'));
          console.warn(`subscribing to ${scripts.length} scripts`);
          for (const script of scripts) {
            await get().subscribeScript(script);
          }
        },
        sync: async (gapLimit = GAP_LIMIT) => {
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          //
          const txidHeight: Map<string, number | undefined> = new Map();
          let restoredScripts: Record<string, ScriptDetails> = {};
          let tempRestoredScripts: Record<string, ScriptDetails> = {};

          let nextExternalIndex = get().nextExternalIndex ?? 0;
          let nextInternalIndex = get().nextInternalIndex ?? 0;

          const walletChains = [0, 1];
          for (const i of walletChains) {
            tempRestoredScripts = {};
            const isInternal = i === 1;
            let batchCount = isInternal ? nextInternalIndex : nextExternalIndex;
            let unusedScriptCounter = 0;

            while (unusedScriptCounter <= gapLimit) {
              const publicKeys = get().deriveBatchPublicKeys(batchCount, batchCount + gapLimit, isInternal);
              const scriptsWithDetails = publicKeys.map((publicKey) => get().createP2PWKHScript(publicKey));
              const scripts = scriptsWithDetails.map(([script]) => Buffer.from(script, 'hex'));
              const histories = await chainSource.fetchHistories(scripts);
              for (const [index, history] of histories.entries()) {
                tempRestoredScripts[scriptsWithDetails[index][0]] = scriptsWithDetails[index][1];
                if (history.length > 0) {
                  unusedScriptCounter = 0; // reset counter
                  // update the restored scripts with all the script details until now
                  restoredScripts = { ...restoredScripts, ...tempRestoredScripts };
                  tempRestoredScripts = {};
                  const newMaxIndex = index + batchCount + 1;
                  if (isInternal) nextInternalIndex = newMaxIndex;
                  else nextExternalIndex = newMaxIndex;

                  // update the history set
                  for (const { tx_hash, height } of history) {
                    txidHeight.set(tx_hash, height);
                  }
                } else {
                  unusedScriptCounter += 1;
                }
              }
              batchCount += gapLimit;
            }
          }

          set({ nextInternalIndex, nextExternalIndex }, false, 'sync/nextIndexes');
          set(
            (state) => ({ scriptDetails: { ...state.scriptDetails, ...restoredScripts } }),
            false,
            'sync/scriptDetails'
          );
          // We set txs, outputHistory and balances only in subscribeScript to avoid doing it twice
          return { nextInternalIndex, nextExternalIndex };
        },
        unblindUtxos: async (outputs) => {
          const scriptDetails = get().scriptDetails;
          const unblindingResults: (UnblindingData | Error)[] = [];
          for (const output of outputs) {
            try {
              // if output is unconfidential and not fees, we don't need to unblind it
              if (!isConfidentialOutput(output) && output.script.toString('hex')) {
                unblindingResults.push({
                  value: confidentialValueToSatoshi(output.value),
                  asset: AssetHash.fromBytes(output.asset).hex,
                  assetBlindingFactor: Buffer.alloc(32).toString('hex'),
                  valueBlindingFactor: Buffer.alloc(32).toString('hex'),
                });
                continue;
              }
              // if output is confidential, we need to unblind it
              const script = output.script.toString('hex');
              const blindingPrivateKey = scriptDetails[script]?.blindingPrivateKey;
              if (!scriptDetails[script]?.blindingPrivateKey) throw new Error('No blinding private key');
              const zkpLib = await zkp();
              const lib = new confidential.Confidential(zkpLib);
              const unblinded = lib.unblindOutputWithKey(output, Buffer.from(blindingPrivateKey, 'hex'));
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
            useAssetStore.getState().fetchAssetData(asset);
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
      }),
      {
        name: 'wallet',
        storage: createJSONStorage(() => storage),
      }
    ),
    { name: 'store', store: 'wallet' }
  )
);
