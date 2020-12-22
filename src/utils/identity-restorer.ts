import { AddressInterface, IdentityRestorerInterface } from 'tdex-sdk';

export class IdentityRestorerFromState implements IdentityRestorerInterface {
  private cachedAddresses: string[];

  constructor(addresses: AddressInterface[]) {
    this.cachedAddresses = addresses.map((addrI) => addrI.confidentialAddress);
  }

  async addressHasBeenUsed(address: string): Promise<boolean> {
    return this.cachedAddresses.includes(address);
  }

  async addressesHaveBeenUsed(addresses: string[]): Promise<boolean[]> {
    return Promise.all(addresses.map((addr) => this.addressHasBeenUsed(addr)));
  }
}
