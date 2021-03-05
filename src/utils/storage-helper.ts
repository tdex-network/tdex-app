import { Storage, Plugins } from '@capacitor/core';
import { AddressInterface, IdentityOpts, IdentityType, Mnemonic } from 'ldk';

import 'capacitor-secure-storage-plugin';
import { decrypt, encrypt, Encrypted } from './crypto';
import { network } from '../redux/config';
import { IdentityRestorerFromState } from './identity-restorer';
import { TDEXProvider } from '../redux/actionTypes/tdexActionTypes';

const { SecureStoragePlugin } = Plugins;

const MNEMONIC_KEY = 'tdex-app-mnemonic';
const ADDRESSES_KEY = 'tdex-app-addresses';
const PROVIDERS_KEY = 'tdex-app-providers';

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
  if (exists) throw Error('You will erase an existing mnemonic');
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

export async function mnemonicInSecureStorage(): Promise<boolean> {
  try {
    await SecureStoragePlugin.get({ key: MNEMONIC_KEY });
    return true;
  } catch (_) {
    return false;
  }
}

export async function removeMnemonicFromSecureStorage(
  pin: string
): Promise<string> {
  const mnemonic = await getMnemonicFromSecureStorage(pin); // will throw an error if the pin can't decrypt the mnemonic
  await SecureStoragePlugin.remove({ key: MNEMONIC_KEY });
  return mnemonic;
}

export async function getIdentity(pin: string): Promise<Mnemonic> {
  const opts = await getIdentityOpts(pin);
  return new Mnemonic(opts);
}

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
