import type { AddressInterface, IdentityInterface, IdentityOpts } from 'ldk';
import { Mnemonic } from 'ldk';
import type { Dispatch } from 'redux';
import { TDEXMnemonic } from 'tdex-sdk';
import type { MnemonicOpts } from 'tdex-sdk';

import { addAddress, watchUtxo } from '../redux/actions/walletActions';

// Used when coins will be received
export class MnemonicRedux extends Mnemonic implements IdentityInterface {
  private readonly dispatch: Dispatch;

  constructor(args: IdentityOpts<MnemonicOpts>, dispatch: Dispatch) {
    super(args);
    this.dispatch = dispatch;
  }

  async getNextAddress(): Promise<AddressInterface> {
    const nextAddr = await super.getNextAddress();
    this.dispatch(addAddress(nextAddr));
    this.dispatch(watchUtxo(nextAddr));
    return nextAddr;
  }

  async getNextChangeAddress(): Promise<AddressInterface> {
    const nextAddr = await super.getNextChangeAddress();
    this.dispatch(addAddress(nextAddr));
    this.dispatch(watchUtxo(nextAddr));
    return nextAddr;
  }
}

export class TDexMnemonicRedux extends TDEXMnemonic {
  private readonly dispatch: Dispatch;

  constructor(args: IdentityOpts<MnemonicOpts>, dispatch: Dispatch) {
    super(args);
    this.dispatch = dispatch;
  }

  async getNextAddress(): Promise<AddressInterface> {
    const nextAddr = await super.getNextAddress();
    this.dispatch(addAddress(nextAddr));
    this.dispatch(watchUtxo(nextAddr));
    return nextAddr;
  }

  async getNextChangeAddress(): Promise<AddressInterface> {
    const nextAddr = await super.getNextChangeAddress();
    this.dispatch(addAddress(nextAddr));
    this.dispatch(watchUtxo(nextAddr));
    return nextAddr;
  }
}
