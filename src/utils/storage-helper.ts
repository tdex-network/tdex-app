import { Storage } from '@capacitor/core';
import { setAddresses } from '../redux/actions/walletActions';
import { AddressInterface } from 'tdex-sdk';

export const storageAddresses = (addresses: AddressInterface[]) => {
  Storage.set({
    key: 'addresses',
    value: JSON.stringify(addresses),
  });
  setAddresses(addresses);
};
