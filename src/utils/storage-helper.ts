import { Storage, Plugins } from '@capacitor/core';
import { AddressInterface } from 'tdex-sdk';
import 'capacitor-secure-storage-plugin';

const { SecureStoragePlugin } = Plugins;

export const storageAddresses = (addresses: AddressInterface[]) => {
  return Storage.set({
    key: 'addresses',
    value: JSON.stringify(addresses),
  });
};

export const MNEMONIC_KEY = 'tdex-app-secure-storage-mnemonic';

export async function setMnemonicInSecureStorage(
  mnemonic: string
): Promise<boolean> {
  return SecureStoragePlugin.set({ key: MNEMONIC_KEY, value: mnemonic });
}

export async function getMnemonicFromSecureStorage(): Promise<string> {
  const { value } = await SecureStoragePlugin.get({ key: MNEMONIC_KEY });
  return value;
}
