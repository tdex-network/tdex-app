import { Storage, Plugins } from '@capacitor/core';
import {
  AddressInterface,
  IdentityOpts,
  IdentityType,
  Mnemonic,
  TxInterface,
  UtxoInterface,
} from 'ldk';
import 'capacitor-secure-storage-plugin';
import { decrypt, encrypt, Encrypted } from './crypto';
import { network } from '../redux/config';
import { IdentityRestorerFromState, MnemonicRedux } from './identity';
import { TDEXProvider } from '../redux/actionTypes/tdexActionTypes';
import { Dispatch } from 'redux';
import { AssetConfig, CURRENCIES, LBTC_DENOMINATIONS } from './constants';
import { CurrencyInterface } from '../redux/reducers/settingsReducer';
import { stringify, parse } from 'buffer-json';

const { SecureStoragePlugin } = Plugins;

const MNEMONIC_KEY = 'tdex-app-mnemonic';
const ADDRESSES_KEY = 'tdex-app-addresses';
const PROVIDERS_KEY = 'tdex-app-providers';
const SEED_BACKUP_FLAG_KEY = 'tdex-app-seed-backup';
const UTXOS_KEY = 'tdex-app-utxos';
const TRANSACTIONS_KEY = 'tdex-app-transactions';
const ASSETS_KEY = 'tdex-app-assets';
const EXPLORER_KEY = 'tdex-app-explorer';
const CURRENCY_KEY = 'tdex-app-currency';
const LBTC_DENOMINATION_KEY = 'tdex-app-lbtc-unit';
const INSTALL_FLAG = 'tdex-app-install-flag';

export async function getLBTCDenominationFromStorage(): Promise<string> {
  return (
    (await Storage.get({ key: LBTC_DENOMINATION_KEY })).value ||
    LBTC_DENOMINATIONS[0]
  );
}

export function setLBTCDenominationInStorage(denomination: string) {
  Storage.set({
    key: LBTC_DENOMINATION_KEY,
    value: denomination,
  });
}

export async function getCurrencyFromStorage(): Promise<CurrencyInterface> {
  return getFromStorage<CurrencyInterface>(CURRENCY_KEY, CURRENCIES[0]);
}

export function setCurrencyInStorage(currency: CurrencyInterface) {
  Storage.set({
    key: CURRENCY_KEY,
    value: stringify(currency),
  });
}

export async function getExplorerFromStorage(): Promise<string> {
  return (await Storage.get({ key: EXPLORER_KEY })).value;
}

export function setExplorerInStorage(explorer: string) {
  Storage.set({ key: EXPLORER_KEY, value: explorer });
}

export async function getTransactionsFromStorage(): Promise<TxInterface[]> {
  return getFromStorage<TxInterface[]>(TRANSACTIONS_KEY, []);
}

export function setTransactionsInStorage(txs: TxInterface[]) {
  Storage.set({ key: TRANSACTIONS_KEY, value: stringify(txs) });
}

export async function getUtxosFromStorage(): Promise<UtxoInterface[]> {
  return getFromStorage<UtxoInterface[]>(UTXOS_KEY, []);
}

export function setUtxosInStorage(utxos: UtxoInterface[]) {
  Storage.set({ key: UTXOS_KEY, value: stringify(utxos) });
}

export async function getAssetsFromStorage(): Promise<AssetConfig[]> {
  return getFromStorage<AssetConfig[]>(ASSETS_KEY, []);
}

export function setAssetsInStorage(assets: AssetConfig[]) {
  Storage.set({ key: ASSETS_KEY, value: stringify(assets) });
}

/**
 * a function using to set the backup flag.
 */
export function setSeedBackup() {
  Storage.set({ key: SEED_BACKUP_FLAG_KEY, value: '1' });
}

/**
 * Check if backup flag is stored.
 */
export async function seedBackupFlag(): Promise<boolean> {
  try {
    const { value } = await Storage.get({ key: SEED_BACKUP_FLAG_KEY });
    if (value) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function setInstallFlag() {
  return Storage.set({ key: INSTALL_FLAG, value: 'true' });
}

export async function installFlag(): Promise<boolean> {
  try {
    const { value } = await Storage.get({ key: INSTALL_FLAG });
    if (value) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Persist providers in Storage
 * @param providers
 */
export function setProvidersInStorage(providers: TDEXProvider[]) {
  return Storage.set({
    key: PROVIDERS_KEY,
    value: stringify(providers),
  });
}

export async function getProvidersFromStorage(): Promise<TDEXProvider[]> {
  return getFromStorage<TDEXProvider[]>(PROVIDERS_KEY, []);
}

export function setAddressesInStorage(addresses: AddressInterface[]) {
  return Storage.set({
    key: ADDRESSES_KEY,
    value: stringify(addresses),
  });
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
export async function changePin(currentPIN: string, newPIN: string) {
  const mnemonic = await removeMnemonicFromSecureStorage(currentPIN);
  await setMnemonicInSecureStorage(mnemonic, newPIN);
}

/**
 * encrypt with pin + store in secure storage.
 * @param mnemonic the mnemonic to store
 * @param pin the password pin
 */
export async function setMnemonicInSecureStorage(
  mnemonic: string,
  pin: string
): Promise<boolean> {
  try {
    await clearStorage();
    const encryptedData = await encrypt(mnemonic, pin);
    const { value } = await SecureStoragePlugin.set({
      key: MNEMONIC_KEY,
      value: JSON.stringify(encryptedData),
    });
    return value;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

/**
 * get mnemonic encrypted in secure storage + decrypt it using PIN
 * @param pin password pin
 */
export async function getMnemonicFromSecureStorage(
  pin: string
): Promise<string> {
  const { value } = await SecureStoragePlugin.get({ key: MNEMONIC_KEY });
  const encryptedData: Encrypted = JSON.parse(value);
  return decrypt(encryptedData, pin);
}

/**
 * return true if a mnemonic is already stored by the app.
 * false otherwise.
 */
export async function mnemonicInSecureStorage(): Promise<boolean> {
  try {
    await SecureStoragePlugin.get({ key: MNEMONIC_KEY });
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Delete the mnemonic from secure storage + clean all other cached data
 * @param pin using to decrypt the existing mnemonic.
 */
export async function removeMnemonicFromSecureStorage(
  pin: string
): Promise<string> {
  const mnemonic = await getMnemonicFromSecureStorage(pin); // will throw an error if the pin can't decrypt the mnemonic
  await clearStorage();
  return mnemonic;
}

/**
 * function using to remove all TDEX data from storage
 */
export async function clearStorage() {
  await SecureStoragePlugin.clear();
  await Storage.clear();
  await setInstallFlag();
}

/**
 * get the identityOpts object and construct a new Mnemonic Identity connected to redux store
 * @param pin using to decrypt the mnemonic
 * @param dispatch using to dispatch action to store
 */
export async function getConnectedIdentity(
  pin: string,
  dispatch: Dispatch
): Promise<MnemonicRedux> {
  const opts = await getIdentityOpts(pin);
  return new MnemonicRedux(opts, dispatch);
}

/**
 * get the identityOpts object and construct a new Mnemonic Identity
 * @param pin using to decrypt the mnemonic
 */
export async function getIdentity(pin: string): Promise<Mnemonic> {
  const opts = await getIdentityOpts(pin);
  return new Mnemonic(opts);
}

/**
 * Return the identityOpts from cached addresses + mnemonic encryted
 * @param pin the pin using to decrypt the mnemonic
 */
export async function getIdentityOpts(pin: string): Promise<IdentityOpts> {
  const [mnemonic, cachedAddresses] = await Promise.all([
    getMnemonicFromSecureStorage(pin),
    getAddressesFromStorage(),
  ]);

  return prepareIdentityOpts(mnemonic, cachedAddresses);
}

function prepareIdentityOpts(
  mnemonic: string,
  addresses: Array<AddressInterface>
): IdentityOpts {
  return {
    chain: network.chain,
    type: IdentityType.Mnemonic,
    value: {
      mnemonic,
    },
    initializeFromRestorer: true,
    restorer: new IdentityRestorerFromState(addresses || []),
  };
}

async function getFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { value } = await Storage.get({ key });
    if (!value) return defaultValue;
    return parse(value) as T;
  } catch (error) {
    console.error(error);
    return defaultValue;
  }
}
