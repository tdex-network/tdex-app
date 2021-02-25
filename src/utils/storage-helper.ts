import { Storage, Plugins } from '@capacitor/core';
import { AddressInterface } from 'ldk';

import 'capacitor-secure-storage-plugin';
import { decrypt, encrypt, Encrypted } from './crypto';

const { SecureStoragePlugin } = Plugins;

export const storageAddresses = (addresses: AddressInterface[]) => {
  return Storage.set({
    key: 'addresses',
    value: JSON.stringify(addresses),
  });
};

export async function getAddresses(): Promise<AddressInterface[]> {
  const { value } = await Storage.get({
    key: 'addresses',
  });

  return JSON.parse(value);
}

// hardcoded key for secure storage
const MNEMONIC_KEY = 'tdex-app-mnemonic';

/**
 * encrypt with pin + store in secure storage.
 * @param mnemonic the mnemonic to store
 * @param pin the password pin
 */
export async function setMnemonicInSecureStorage(
  mnemonic: string,
  pin: string,
): Promise<boolean> {
  const encryptedData = await encrypt(mnemonic, pin)
  return SecureStoragePlugin.set({ key: MNEMONIC_KEY, value: JSON.stringify(encryptedData) });
}

/**
 * get mnemonic encrypted in secure storage + decrypt it using PIN
 * @param pin password pin
 */
export async function getMnemonicFromSecureStorage(pin: string): Promise<string> {
  const { value } = await SecureStoragePlugin.get({ key: MNEMONIC_KEY });
  const encryptedData: Encrypted = JSON.parse(value)
  return decrypt(encryptedData, pin)
}

export async function removeMnemonicFromSecureStorage(): Promise<boolean> {
  return SecureStoragePlugin.remove({ key: MNEMONIC_KEY });
}
