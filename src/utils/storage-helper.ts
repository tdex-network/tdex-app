import { Storage } from '@capacitor/core';
import { AddressInterface } from 'tdex-sdk';

export const storageAddresses = (addresses: AddressInterface[]) => {
  return Storage.set({
    key: 'addresses',
    value: JSON.stringify(addresses),
  });
};
