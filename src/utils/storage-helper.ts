import { Storage } from '@capacitor/core';
import { AddressInterface } from 'tdex-sdk';
import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';

const { SecureStoragePlugin } = Plugins;

export const storageAddresses = (addresses: AddressInterface[]) => {
  return Storage.set({
    key: 'addresses',
    value: JSON.stringify(addresses),
  });
};

export interface SecureStorageI {
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<string>;
}

class UnsecureStorage implements SecureStorageI {
  async get(key: string): Promise<string> {
    return Storage.get({ key }).then(({ value }) => value);
  }

  async set(key: string, value: string): Promise<string> {
    return Storage.set({ key, value }).then(() => value);
  }
}

export const SECURE_STORE_NAMESPACE = 'tdex-app-secure-storage';
export const MNEMONIC_KEY = 'tdex-app-secure-storage-mnemonic';

async function getSecureStore(): Promise<SecureStorageI> {
  const secureStorageEcho = await SecureStorageEcho.create(
    SECURE_STORE_NAMESPACE
  );
  if (secureStorageEcho) {
    return secureStorageEcho;
  }
  console.warn(
    'secure-storage-echo not available: tdex-app will use a mock secure storage (not recommended for production)'
  );
  return new UnsecureStorage();
}

export async function setMnemonicInSecureStorage(mnemonic: string) {
  (await getSecureStore()).set(MNEMONIC_KEY, mnemonic).catch(console.error);
}

export async function getMnemonicFromSecureStorage(): Promise<string> {
  const secureStore = await getSecureStore();
  const r = await secureStore.get(MNEMONIC_KEY);
  console.log(r);
  return r;
}
