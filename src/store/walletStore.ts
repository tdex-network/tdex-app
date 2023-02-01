import axios from 'axios';
import BIP32Factory from 'bip32';
import { address, networks, payments, Transaction } from 'liquidjs-lib';
import { confidentialValueToSatoshi } from 'liquidjs-lib/src/confidential';
import moment from 'moment';
import { SLIP77Factory } from 'slip77';
import * as ecc from 'tiny-secp256k1';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { WsElectrumChainSource } from '../services/chainSource';
import { ElectrumWS } from '../services/ws/ws-electrs';
import { LBTC_ASSET, LBTC_COINGECKOID } from '../utils/constants';
import type { Encrypted } from '../utils/crypto';
import { decrypt, encrypt } from '../utils/crypto';
import { toXpub } from '../utils/fromXpub';
import {
  fromSatoshi,
  getIndexAndIsChangeFromAddress,
  isLbtc,
  isLcad,
  isUsdt,
  outpointToString,
  sleep,
} from '../utils/helpers';

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
  address?: string; // not necessary for fee output
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
  lastUsedExternalIndex?: number;
  lastUsedInternalIndex?: number;
  lockedOutpoints: string[];
  masterPublicKey: string;
  masterBlindingKey: string;
  scriptDetails: Record<string, ScriptDetails>; // script, scriptDetails
  txs?: Record<string, TxDetails>; // txid, transaction
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
  deriveBatch: (
    start: number,
    end: number,
    isInternal: boolean,
    updateCache?: boolean
  ) => Promise<Record<string, ScriptDetails>>;
  deriveBlindingKey: (script: Buffer) => { publicKey: Buffer; privateKey: Buffer };
  getAllAddresses: () => Promise<string[]>;
  getNextAddress: (isInternal: boolean) => Promise<ScriptDetails>;
  lockOutpoint: (outpoint: Outpoint) => string;
  selectUtxos: (targets: Recipient[], lock: boolean) => Promise<CoinSelection>;
  setEncryptedMnemonic: (encryptedMnemonic: Encrypted) => void;
  setIsAuthorized: (isAuthorized: boolean) => void;
  setLastUsedExternalIndex: (lastUsedExternalIndex: number) => void;
  setLastUsedInternalIndex: (lastUsedInternalIndex: number) => void;
  setMasterBlindingKey: (mnemonic: string) => void;
  setMasterPublicKey: (mnemonic: string) => void;
  setUtxo: (utxo: UnblindedOutput) => void;
  subscribeAllScripts: () => Promise<void>;
  subscribeBatch: (start: number, end: number, isInternal: boolean) => Promise<void>;
  sync: (gapLimit: number) => Promise<{ lastUsed: { internal: number; external: number } }>;
  reset: () => void;
  resetUtxos: () => void;
  unlockOutpoint: (outpointStr: string) => void;
  unlockOutpoints: () => void;
}

const initialState: WalletState = {
  scriptDetails: {},
  balances: undefined,
  encryptedMnemonic: undefined,
  isAuthorized: false,
  lastUsedInternalIndex: undefined,
  lastUsedExternalIndex: undefined,
  lockedOutpoints: [],
  masterPublicKey: '',
  masterBlindingKey: '',
  txs: undefined,
  totalBtc: undefined,
  txsHeuristic: undefined,
  utxos: {},
};

const GAP_LIMIT = 20;

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
                lastUsedInternalIndex: isChange ? index : state.lastUsedInternalIndex,
                lastUsedExternalIndex: isChange ? state.lastUsedExternalIndex : index,
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
              lastUsedInternalIndex: undefined,
              lastUsedExternalIndex: undefined,
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
              balances[assetHash].sats = (balances[assetHash].sats ?? 0) + assetAmount;
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
              vs_currencies: 'usd,cad',
            },
          });
          if (status !== 200) {
            console.error('CoinGecko price fetching failed');
            return {};
          }
          let totalBtc = 0;
          for (const [assetHash, balance] of Object.entries(balances)) {
            // compute fiat counter-value for lbtc
            if (isLbtc(assetHash, network)) {
              balance.counterValue =
                fromSatoshi(balance.sats.toString()).toNumber() * data[LBTC_COINGECKOID][currency.ticker];
              totalBtc += fromSatoshi(balance.sats.toString()).toNumber();
            }
            // compute lbtc counter-value for available fiat currencies (usd, cad)
            if (isUsdt(assetHash, network)) {
              balance.counterValue = fromSatoshi(balance.sats.toString()).toNumber() / data[LBTC_COINGECKOID]['usd'];
              totalBtc += balance.counterValue;
            }
            if (isLcad(assetHash, network)) {
              balance.counterValue = fromSatoshi(balance.sats.toString()).toNumber() / data[LBTC_COINGECKOID]['cad'];
              totalBtc += balance.counterValue;
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
                sats: totalBtc,
                counterValue: fromSatoshi(totalBtc.toString()).toNumber() * data[LBTC_COINGECKOID][currency.ticker],
                value: fromSatoshi(totalBtc.toString(), 8, lbtcDenomination).toNumber(),
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
              fee = confidentialValueToSatoshi(Buffer.from(output.value.toString()));
              continue;
            }
            const blindingData = utxos[outpointToString({ txid: tx.getId(), vout: index })].blindingData;
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
              ].blindingData;
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
        deriveBatch: async (start: number, end: number, isInternal: boolean, updateCache = true) => {
          const node = bip32.fromBase58(get().masterPublicKey);
          const chain = isInternal ? 1 : 0;
          let scriptDetails = get().scriptDetails;
          for (let i = start; i < end; i++) {
            const child = node.derive(chain).derive(i);
            const network = useSettingsStore.getState().network;
            const p2wpkh = payments.p2wpkh({ pubkey: child.publicKey, network: networks[network] });
            const script = p2wpkh.output;
            if (!script) continue;
            const { publicKey: blindingPublicKeyBuffer, privateKey: blindingPrivateKeyBuffer } =
              get().deriveBlindingKey(script);
            if (!blindingPrivateKeyBuffer) throw new Error('Could not derive blinding key');
            scriptDetails[script.toString('hex')] = {
              blindingPrivateKey: Buffer.from(blindingPrivateKeyBuffer).toString('hex'),
              blindingPublicKey: Buffer.from(blindingPublicKeyBuffer).toString('hex'),
              confidentialAddress: p2wpkh.address
                ? address.toConfidential(p2wpkh.address, blindingPublicKeyBuffer)
                : undefined,
              derivationPath: `m/${chain}/${start + i}`,
              script: script.toString('hex'),
              publicKey: child.publicKey.toString('hex'),
            };
          }
          set({ scriptDetails: scriptDetails }, false, 'deriveBatch');
          return scriptDetails;
        },
        deriveBlindingKey: (script: Buffer) => {
          const blindingKeyNode = slip77.fromMasterBlindingKey(get().masterBlindingKey);
          const derived = blindingKeyNode.derive(script);
          if (!derived.publicKey || !derived.privateKey) throw new Error('Could not derive blinding key');
          return { publicKey: derived.publicKey, privateKey: derived.privateKey };
        },
        getAllAddresses: async () => {
          const lastUsedExternalIndex = get().lastUsedExternalIndex ?? 0;
          const lastUsedInternalIndex = get().lastUsedInternalIndex ?? 0;
          const network = useSettingsStore.getState().network;
          const externalScripts = Object.keys(await get().deriveBatch(0, lastUsedExternalIndex, false, false));
          const internalScripts = Object.keys(await get().deriveBatch(0, lastUsedInternalIndex, true, false));
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
          const lastUsed = isInternal ? get().lastUsedInternalIndex ?? 0 : get().lastUsedExternalIndex ?? 0;
          console.log('lastUsed', lastUsed);
          const scriptDetails = Object.keys(await get().deriveBatch(lastUsed, lastUsed + 1, isInternal));
          console.log('scriptDetails', scriptDetails);
          const script = scriptDetails[0];
          if (!script) throw new Error('Could not derive script');
          const { publicKey, privateKey } = get().deriveBlindingKey(Buffer.from(script, 'hex'));
          const payment = payments.p2wpkh({
            output: Buffer.from(script, 'hex'),
            network: networks[network],
            blindkey: publicKey,
          });
          if (!payment) throw new Error('Could not derive address');
          if (isInternal) {
            set({ lastUsedInternalIndex: lastUsed + 1 }, false, 'getNextAddress/internal');
          } else {
            set({ lastUsedExternalIndex: lastUsed + 1 }, false, 'getNextAddress/external');
          }
          return {
            confidentialAddress: payment.confidentialAddress!,
            blindingPrivateKey: privateKey.toString('hex'),
            blindingPublicKey: publicKey.toString('hex'),
            publicKey: payment.pubkey?.toString('hex'),
            script: script,
          };
        },
        lockOutpoint: ({ txid, vout }) => {
          set(() => ({ lockedOutpoints: [outpointToString({ txid, vout })] }), false, 'lockOutpoint');
          return outpointToString({ txid, vout });
        },
        reset: () => set(initialState, true, 'reset'),
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
          if (lock) {
            const lockedOutpoints = selectedUtxos.map((utxo) => get().lockOutpoint(utxo));
            await sleep(60_000);
            lockedOutpoints.forEach((outpoints) => get().unlockOutpoint(outpoints));
          }
          return {
            utxos: selectedUtxos,
            changeOutputs,
          };
        },
        setEncryptedMnemonic: (encryptedMnemonic: Encrypted) =>
          set({ encryptedMnemonic }, false, 'setEncryptedMnemonic'),
        setIsAuthorized: (isAuthorized: boolean) => set({ isAuthorized }, false, 'setIsAuthorized'),
        setLastUsedExternalIndex: (lastUsedExternalIndex: number) =>
          set({ lastUsedExternalIndex }, false, 'setLastUsedExternalIndex'),
        setLastUsedInternalIndex: (lastUsedInternalIndex: number) =>
          set({ lastUsedInternalIndex }, false, 'setLastUsedInternalIndex'),
        setMasterBlindingKey: (masterBlindingKey: string) =>
          set((state) => ({ masterBlindingKey }), false, 'setMasterBlindingKey'),
        // use xpub format for all networks to be more compatible with all other wallets that only uses xpub in Liquid (specter)
        setMasterPublicKey: (masterPublicKey: string) =>
          set({ masterPublicKey: toXpub(masterPublicKey) }, false, 'setMasterPublicKey'),
        setUtxo: (utxo: UnblindedOutput) => set({ utxos: { [outpointToString(utxo)]: utxo } }, false, 'setUtxo'),
        subscribeAllScripts: async () => {
          let lastUsedExternalIndex = get().lastUsedExternalIndex ?? 0;
          let lastUsedInternalIndex = get().lastUsedInternalIndex ?? 0;
          const walletChains = [0, 1];
          for (const i of walletChains) {
            const isInternal = i === 1;
            const lastUsedIndex = isInternal ? lastUsedInternalIndex : lastUsedExternalIndex;
            await get().subscribeBatch(0, lastUsedIndex, isInternal);
          }
        },
        subscribeBatch: async (start: number, end: number, isInternal: boolean) => {
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          const scriptDetails = Object.values(await get().deriveBatch(start, end, isInternal, false));
          for (const { script } of scriptDetails) {
            if (!script) continue;
            await chainSource.subscribeScriptStatus(
              Buffer.from(script, 'hex'),
              async (_: string, status: string | null) => {
                const history = await chainSource.fetchHistories([Buffer.from(script, 'hex')]);
                const transactions = await chainSource.fetchTransactions(history[0].map(({ tx_hash }) => tx_hash));
                transactions.forEach(({ txid, hex }) => {
                  set(
                    {
                      txs: {
                        [txid]: { hex, height: history[0].find(({ tx_hash, height }) => tx_hash === txid)?.height },
                      },
                    },
                    false,
                    'subscribeBatch'
                  );
                });
                /*
              const unspents = await chainSource.fetchUnspentOutputs([script]);
              const unspentForScript = unspents[0];
              await this.walletRepository.updateScriptUnspents({
                [script.toString('hex')]: unspentForScript,
              });
              */
              }
            );
          }
        },
        sync: async (gapLimit = GAP_LIMIT) => {
          const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
          const client = new ElectrumWS(websocketExplorerURL);
          const chainSource = new WsElectrumChainSource(client);
          const historyTxsId: Set<string> = new Set();
          const heightsSet: Set<number> = new Set();
          const txidHeight: Map<string, number | undefined> = new Map();
          let lastUsedExternalIndex = get().lastUsedExternalIndex ?? 0;
          let lastUsedInternalIndex = get().lastUsedInternalIndex ?? 0;
          const walletChains = [0, 1];
          for (const i of walletChains) {
            const isInternal = i === 1;
            let batchCount: number = isInternal ? lastUsedInternalIndex : lastUsedExternalIndex;
            let unusedScriptCounter = 0;
            while (unusedScriptCounter <= gapLimit) {
              const scriptDetails = await get().deriveBatch(batchCount, batchCount + gapLimit, isInternal, false);
              const histories = await chainSource.fetchHistories(
                Object.values(scriptDetails).map(({ script }) => Buffer.from(script, 'hex'))
              );
              for (const [index, history] of histories.entries()) {
                if (history.length > 0) {
                  unusedScriptCounter = 0; // reset counter
                  const newMaxIndex = index + 1 + batchCount;
                  if (isInternal) {
                    lastUsedInternalIndex = newMaxIndex;
                  } else {
                    lastUsedExternalIndex = newMaxIndex;
                  }
                  // update the history set
                  for (const { tx_hash, height } of history) {
                    historyTxsId.add(tx_hash);
                    if (height !== undefined) heightsSet.add(height);
                    txidHeight.set(tx_hash, height);
                  }
                } else {
                  unusedScriptCounter += 1;
                }
              }
              batchCount += gapLimit;
            }
          }
          set({ lastUsedInternalIndex }, false, 'sync/lastUsedInternalIndex');
          set({ lastUsedExternalIndex }, false, 'sync/lastUsedExternalIndex');
          /*
          walletRepository.addTransactions(this.network.name as NetworkString, ...historyTxsId)
          get().updateTxDetails(
            Object.fromEntries(Array.from(historyTxsId).map((txid) => [txid, { height: txidHeight.get(txid) }]))
          );
          */
          // fetch the unspents
          // const externalScripts = Object.values(await get().deriveBatch(0, lastUsedExternalIndex, false));
          // const internalScripts = Object.values(await get().deriveBatch(0, lastUsedInternalIndex, true));
          // const scriptToUpdate = [...externalScripts.map((s) => s.script), ...internalScripts.map((s) => s.script)];
          // const unspents = await chainSource.fetchUnspentOutputs(scriptToUpdate);
          /* await get().updateScriptUnspents(
              Object.fromEntries(
                unspents
                  .filter((ls) => ls.length > 0)
                  .map((utxos, index) => [scriptToUpdate[index].toString('hex'), utxos])
              )
            );*/
          return {
            lastUsed: {
              internal: lastUsedInternalIndex,
              external: lastUsedExternalIndex,
            },
          };
        },
        resetUtxos: () => set({ utxos: {} }, false, 'resetUtxos'),
        unlockOutpoint: (outpointStr: string) => {
          set(
            (state) => ({
              lockedOutpoints: state.lockedOutpoints.filter((outpoint: string) => outpoint !== outpointStr),
            }),
            true,
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
