import { Preferences } from '@capacitor/preferences';
import { stringify, parse } from 'buffer-json';
import { IdentityType, Mnemonic } from 'ldk';
import type { AddressInterface, TxInterface } from 'ldk';
import type { StateRestorerOpts } from 'ldk/dist/restorer/mnemonic-restorer';
import type { Dispatch } from 'redux';
import type { NetworkString, TDEXMnemonic, UnblindedOutput } from 'tdex-sdk';
import * as ecc from 'tiny-secp256k1';

import type { TDEXProvider } from '../redux/actionTypes/tdexActionTypes';
import type { Pegins } from '../redux/reducers/btcReducer';
import type { CurrencyInterface } from '../redux/reducers/settingsReducer';

import type { AssetConfig } from './constants';
import { CURRENCIES, LBTC_DENOMINATIONS } from './constants';
import type { Encrypted } from './crypto';
import { decrypt, encrypt } from './crypto';
import { MnemonicRedux, TDexMnemonicRedux } from './identity';

const MNEMONIC_KEY = 'tdex-app-mnemonic';
const ADDRESSES_KEY = 'tdex-app-addresses';
const PEGINS_KEY = 'tdex-app-pegins';
const PROVIDERS_KEY = 'tdex-app-providers';
const SEED_BACKUP_FLAG_KEY = 'tdex-app-seed-backup';
const UTXOS_KEY = 'tdex-app-utxos';
const TRANSACTIONS_KEY = 'tdex-app-transactions';
const ASSETS_KEY = 'tdex-app-assets';
const DEFAULT_PROVIDER_KEY = 'tdex-app-default-provider';
const NETWORK_KEY = 'tdex-app-network';
const EXPLORER_KEY = 'tdex-app-explorer';
const EXPLORER_BITCOIN_KEY = 'tdex-app-explorer-bitcoin';
const EXPLORER_LIQUID_UI_KEY = 'tdex-app-explorer-liquid-ui';
const EXPLORER_BITCOIN_UI_KEY = 'tdex-app-explorer-bitcoin-ui';
const ELECTRS_BATCH_API_KEY = 'tdex-app-electrs-batch-api';
const TOR_PROXY_KEY = 'tdex-app-tor-proxy';
const CURRENCY_KEY = 'tdex-app-currency';
const LBTC_DENOMINATION_KEY = 'tdex-app-lbtc-unit';
const LAST_USED_INDEXES_KEY = 'tdex-app-last-used-indexes';

export async function getThemeFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: 'theme' })).value;
}

export function setThemeInStorage(theme: string): Promise<void> {
  return Preferences.set({ key: 'theme', value: theme });
}

export async function getLBTCDenominationFromStorage(): Promise<string> {
  return (await Preferences.get({ key: LBTC_DENOMINATION_KEY })).value || LBTC_DENOMINATIONS[0];
}

export function setLBTCDenominationInStorage(denomination: string): Promise<void> {
  return Preferences.set({
    key: LBTC_DENOMINATION_KEY,
    value: denomination,
  });
}

export async function getCurrencyFromStorage(): Promise<CurrencyInterface> {
  return getFromStorage<CurrencyInterface>(CURRENCY_KEY, CURRENCIES[0]);
}

export function setCurrencyInStorage(currency: CurrencyInterface): Promise<void> {
  return Preferences.set({
    key: CURRENCY_KEY,
    value: stringify(currency),
  });
}

export async function getDefaultProviderFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: DEFAULT_PROVIDER_KEY })).value;
}

export function setDefaultProviderInStorage(defaultProvider: string): Promise<void> {
  return Preferences.set({ key: DEFAULT_PROVIDER_KEY, value: defaultProvider });
}

export async function getNetworkFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: NETWORK_KEY })).value;
}

export function setNetworkInStorage(network: NetworkString): Promise<void> {
  return Preferences.set({ key: NETWORK_KEY, value: network });
}

export async function getExplorerFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: EXPLORER_KEY })).value;
}

export function setExplorerInStorage(explorer: string): Promise<void> {
  return Preferences.set({ key: EXPLORER_KEY, value: explorer });
}

export async function getExplorerBitcoinFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: EXPLORER_BITCOIN_KEY })).value;
}

export function setExplorerBitcoinInStorage(explorerBitcoin: string): Promise<void> {
  return Preferences.set({ key: EXPLORER_BITCOIN_KEY, value: explorerBitcoin });
}

export async function getElectrsBatchApiFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: ELECTRS_BATCH_API_KEY })).value;
}

export function setElectrsBatchApiInStorage(electrsBatchAPI: string): Promise<void> {
  return Preferences.set({ key: ELECTRS_BATCH_API_KEY, value: electrsBatchAPI });
}

export async function getExplorerLiquidUIFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: EXPLORER_LIQUID_UI_KEY })).value;
}

export function setExplorerLiquidUIInStorage(explorer: string): Promise<void> {
  return Preferences.set({ key: EXPLORER_LIQUID_UI_KEY, value: explorer });
}

export async function getExplorerBitcoinUIFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: EXPLORER_BITCOIN_UI_KEY })).value;
}

export function setExplorerBitcoinUIInStorage(explorerBitcoin: string): Promise<void> {
  return Preferences.set({ key: EXPLORER_BITCOIN_UI_KEY, value: explorerBitcoin });
}

export async function getTorProxyFromStorage(): Promise<string | null> {
  return (await Preferences.get({ key: TOR_PROXY_KEY })).value;
}

export function setTorProxyInStorage(torProxy: string): Promise<void> {
  return Preferences.set({ key: TOR_PROXY_KEY, value: torProxy });
}

export async function getTransactionsFromStorage(): Promise<TxInterface[]> {
  return getFromStorage<TxInterface[]>(TRANSACTIONS_KEY, []);
}

export function setTransactionsInStorage(txs: TxInterface[]): Promise<void> {
  return Preferences.set({ key: TRANSACTIONS_KEY, value: stringify(txs) });
}

export async function clearTransactionsInStorage(): Promise<void> {
  await Preferences.remove({ key: TRANSACTIONS_KEY });
}

export async function getUtxosFromStorage(): Promise<UnblindedOutput[]> {
  return getFromStorage<UnblindedOutput[]>(UTXOS_KEY, []);
}

export function setUtxosInStorage(utxos: UnblindedOutput[]): Promise<void> {
  return Preferences.set({ key: UTXOS_KEY, value: stringify(utxos) });
}

export async function getAssetsFromStorage(): Promise<AssetConfig[]> {
  return getFromStorage<AssetConfig[]>(ASSETS_KEY, []);
}

export function setAssetsInStorage(assets: AssetConfig[]): Promise<void> {
  return Preferences.set({ key: ASSETS_KEY, value: stringify(assets) });
}

export async function clearAssetsInStorage(): Promise<void> {
  await Preferences.remove({ key: ASSETS_KEY });
}

/**
 * a function using to set the backup flag.
 */
export function setSeedBackupFlag(flag: boolean): void {
  if (flag) {
    Preferences.set({ key: SEED_BACKUP_FLAG_KEY, value: '1' }).catch(console.error);
  } else {
    Preferences.remove({ key: SEED_BACKUP_FLAG_KEY }).catch(console.error);
  }
}

/**
 * Check if backup flag is stored.
 */
export async function seedBackupFlag(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: SEED_BACKUP_FLAG_KEY });
    return !!value;
  } catch {
    return false;
  }
}

/**
 * Persist providers in Storage
 * @param providers
 */
export function setProvidersInStorage(providers: TDEXProvider[]): Promise<void> {
  return Preferences.set({
    key: PROVIDERS_KEY,
    value: stringify(providers),
  });
}

export async function getProvidersFromStorage(): Promise<TDEXProvider[]> {
  return getFromStorage<TDEXProvider[]>(PROVIDERS_KEY, []);
}

export function setAddressesInStorage(addresses: AddressInterface[]): Promise<void> {
  return Preferences.set({
    key: ADDRESSES_KEY,
    value: stringify(addresses),
  });
}

export function setLastUsedIndexesInStorage(lastUsedIndexes: StateRestorerOpts): Promise<void> {
  return Preferences.set({
    key: LAST_USED_INDEXES_KEY,
    value: stringify(lastUsedIndexes),
  });
}

export async function getLastUsedIndexesInStorage(): Promise<StateRestorerOpts | null> {
  const idx = await Preferences.get({ key: LAST_USED_INDEXES_KEY });
  return idx.value ? parse(idx.value) : null;
}

export function setPeginsInStorage(pegins: Pegins): Promise<void> {
  return Preferences.set({
    key: PEGINS_KEY,
    value: stringify(pegins),
  });
}

export async function getPeginsFromStorage(): Promise<Pegins> {
  return getFromStorage<Pegins>(PEGINS_KEY, {});
}

export async function getAddressesFromStorage(): Promise<AddressInterface[]> {
  return getFromStorage<AddressInterface[]>(ADDRESSES_KEY, []);
}

/**
 * Decrypt existing mnemonic and then remove it.
 * Re-encrypt it using newPIN.
 * @param currentPIN the current PIN used to decrypt the current mnemonic.
 * @param newPIN new PIN.
 */
export async function changePin(currentPIN: string, newPIN: string): Promise<boolean> {
  const mnemonic = await removeMnemonicFromStorage(currentPIN);
  return setMnemonicInSecureStorage(mnemonic, newPIN);
}

/**
 * encrypt with pin + store in secure storage.
 * @param mnemonic the mnemonic to store
 * @param pin the password pin
 */
export async function setMnemonicInSecureStorage(mnemonic: string, pin: string): Promise<boolean> {
  const encryptedData = await encrypt(mnemonic, pin);
  await Preferences.set({
    key: MNEMONIC_KEY,
    value: JSON.stringify(encryptedData),
  });
  return true;
}

/**
 * get mnemonic encrypted in secure storage + decrypt it using PIN
 * @param pin password pin
 */
export async function getMnemonicFromStorage(pin: string): Promise<string> {
  const { value } = await Preferences.get({ key: MNEMONIC_KEY });
  const encryptedData: Encrypted = JSON.parse(value ?? '');
  return decrypt(encryptedData, pin);
}

/**
 * return true if a mnemonic is already stored by the app.
 * false otherwise.
 */
export async function checkMnemonicInStorage(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: MNEMONIC_KEY });
    if (!value) throw new Error('No mnemonic in storage');
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Delete the mnemonic from secure storage + clean all other cached data
 * @param pin using to decrypt the existing mnemonic.
 */
export async function removeMnemonicFromStorage(pin: string): Promise<string> {
  const mnemonic = await getMnemonicFromStorage(pin); // will throw an error if the pin can't decrypt the mnemonic
  await clearStorage();
  return mnemonic;
}

/**
 * function using to remove all TDEX data from storage
 */
export async function clearStorage(): Promise<void> {
  await Preferences.clear();
}

/**
 * Construct a new Mnemonic Identity connected to redux store
 * @param pin using to decrypt the mnemonic
 * @param dispatch using to dispatch action to store
 * @param network
 */
export async function getConnectedIdentity(
  pin: string,
  dispatch: Dispatch,
  network: NetworkString
): Promise<MnemonicRedux> {
  const toRestoreMnemonic = await getMnemonicFromStorage(pin);
  return new MnemonicRedux(
    {
      chain: network,
      type: IdentityType.Mnemonic,
      opts: {
        mnemonic: toRestoreMnemonic,
      },
      ecclib: ecc,
    },
    dispatch
  );
}

export async function getConnectedTDexMnemonic(
  pin: string,
  dispatch: Dispatch,
  network: NetworkString
): Promise<TDEXMnemonic> {
  const toRestoreMnemonic = await getMnemonicFromStorage(pin);
  return new TDexMnemonicRedux(
    {
      chain: network,
      type: IdentityType.Mnemonic,
      opts: {
        mnemonic: toRestoreMnemonic,
      },
      ecclib: ecc,
    },
    dispatch
  );
}

/**
 * Construct a new Mnemonic Identity
 * @param pin using to decrypt the mnemonic
 * @param network
 */
export async function getIdentity(pin: string, network: NetworkString): Promise<Mnemonic> {
  const toRestoreMnemonic = await getMnemonicFromStorage(pin);
  return new Mnemonic({
    chain: network,
    type: IdentityType.Mnemonic,
    opts: {
      mnemonic: toRestoreMnemonic,
    },
    ecclib: ecc,
  });
}

async function getFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { value } = await Preferences.get({ key });
    if (!value) return defaultValue;
    return parse(value) as T;
  } catch (error) {
    console.error(error);
    return defaultValue;
  }
}
