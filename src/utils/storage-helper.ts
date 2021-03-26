import { Storage, Plugins } from '@capacitor/core';
import { AddressInterface, IdentityOpts, IdentityType, Mnemonic } from 'ldk';

import 'capacitor-secure-storage-plugin';
import { decrypt, encrypt, Encrypted } from './crypto';
import { network } from '../redux/config';
import { IdentityRestorerFromState, MnemonicRedux } from './identity';
import { TDEXProvider } from '../redux/actionTypes/tdexActionTypes';
import { Dispatch } from 'redux';

const { SecureStoragePlugin } = Plugins;

const MNEMONIC_KEY = 'tdex-app-mnemonic';
const ADDRESSES_KEY = 'tdex-app-addresses';
const PROVIDERS_KEY = 'tdex-app-providers';
const SEED_BACKUP_FLAG_KEY = 'tdex-app-seed-backup';

async function getFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { value } = await Storage.get({ key });
    if (!value) return defaultValue;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(error);
    return defaultValue;
  }
}

export function setSeedBackup() {
  Storage.set({ key: SEED_BACKUP_FLAG_KEY, value: '1' });
}

export async function seedBackupFlag(): Promise<boolean> {
  try {
    const { value } = await Storage.get({ key: SEED_BACKUP_FLAG_KEY });
    if (value === '1') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function setProvidersInStorage(providers: TDEXProvider[]) {
  return Storage.set({
    key: PROVIDERS_KEY,
    value: JSON.stringify(providers),
  });
}

export async function getProvidersFromStorage(): Promise<TDEXProvider[]> {
  return getFromStorage<TDEXProvider[]>(PROVIDERS_KEY, []);
}

export function setAddressesInStorage(addresses: AddressInterface[]) {
  return Storage.set({
    key: ADDRESSES_KEY,
    value: JSON.stringify(addresses),
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
  const exists = await mnemonicInSecureStorage();
  if (exists) {
    await clear();
  }
  const encryptedData = await encrypt(mnemonic, pin);
  return SecureStoragePlugin.set({
    key: MNEMONIC_KEY,
    value: JSON.stringify(encryptedData),
  });
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
  await clear();
  return mnemonic;
}

async function clear() {
  await Promise.all([
    SecureStoragePlugin.remove({ key: MNEMONIC_KEY }),
    Storage.remove({ key: PROVIDERS_KEY }),
    Storage.remove({ key: ADDRESSES_KEY }),
    Storage.remove({ key: SEED_BACKUP_FLAG_KEY }),
  ]);
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
