import {
  AddressInterface,
  EsploraIdentityRestorer,
  IdentityInterface,
  IdentityOpts,
  IdentityRestorerInterface,
  Mnemonic,
} from 'ldk';
import { Dispatch } from 'redux';
import { addAddress } from '../redux/actions/walletActions';
import { network } from '../redux/config';

export class MnemonicRedux extends Mnemonic implements IdentityInterface {
  private dispatch: Dispatch;

  constructor(args: IdentityOpts, dispatch: Dispatch) {
    super(args);
    this.dispatch = dispatch;
  }

  getNextAddress(): AddressInterface {
    const nextAddr = super.getNextAddress();
    this.dispatch(addAddress(nextAddr));
    return nextAddr;
  }

  getNextChangeAddress(): AddressInterface {
    const nextAddr = super.getNextChangeAddress();
    this.dispatch(addAddress(nextAddr));
    return nextAddr;
  }
}

export class IdentityRestorerFromState implements IdentityRestorerInterface {
  static esploraIdentityRestorer = new EsploraIdentityRestorer(
    network.explorer
  );

  private cachedAddresses: string[] = [];

  constructor(addresses: AddressInterface[]) {
    if (addresses !== null)
      this.cachedAddresses = addresses.map(
        (addrI) => addrI.confidentialAddress
      );
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
