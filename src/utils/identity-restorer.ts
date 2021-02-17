import {
  AddressInterface,
  EsploraIdentityRestorer,
  IdentityRestorerInterface,
} from 'ldk';
import { network } from '../redux/config';

export class IdentityRestorerFromState implements IdentityRestorerInterface {
  static esploraIdentityRestorer = new EsploraIdentityRestorer(
    network.explorer
  );
  private cachedAddresses: string[];

  constructor(addresses: AddressInterface[]) {
    this.cachedAddresses = addresses.map((addrI) => addrI.confidentialAddress);
  }

  async addressHasBeenUsed(address: string): Promise<boolean> {
    const addressInCache = this.cachedAddresses.includes(address);
    if (addressInCache) return true;
    return IdentityRestorerFromState.esploraIdentityRestorer.addressHasBeenUsed(
      address
    );
  }

  async addressesHaveBeenUsed(addresses: string[]): Promise<boolean[]> {
    return Promise.all(addresses.map((addr) => this.addressHasBeenUsed(addr)));
  }
}
