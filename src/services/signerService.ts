import type { BIP32Interface } from 'bip32';
import { BIP32Factory } from 'bip32';
import { mnemonicToSeed } from 'bip39';
import { Pset, Signer, Transaction, script as bscript, Finalizer, Extractor } from 'liquidjs-lib';
import * as ecc from 'tiny-secp256k1';

import { useWalletStore } from '../store/walletStore';
import { decrypt } from '../utils/crypto';

const bip32 = BIP32Factory(ecc);
const sigValidator = Pset.ECDSASigValidator(ecc);

export class SignerService {
  private masterNode: BIP32Interface;

  constructor(masterNode: BIP32Interface) {
    this.masterNode = masterNode;
  }

  static async fromPin(pin: string): Promise<SignerService> {
    const encryptedMnemonic = useWalletStore.getState().encryptedMnemonic;
    if (!encryptedMnemonic) throw new Error('No mnemonic found in wallet');
    const decryptedMnemonic = await decrypt(encryptedMnemonic, pin);
    const masterNode = bip32.fromSeed(await mnemonicToSeed(decryptedMnemonic));
    return new SignerService(masterNode);
  }

  async signPset(pset: Pset): Promise<string> {
    const scriptDetails = useWalletStore.getState().scriptDetails;
    const signer = new Signer(pset);
    for (const [index, input] of signer.pset.inputs.entries()) {
      const script = input.witnessUtxo?.script;
      if (!script) continue;
      if (!scriptDetails || !scriptDetails.derivationPath) continue;
      const key = this.masterNode
        .derivePath('0')
        .derivePath(scriptDetails[script.toString('hex')].derivationPath?.replace('m/', '')!);
      const sighash = input.sighashType || Transaction.SIGHASH_ALL;
      const signature = key.sign(pset.getInputPreimage(index, sighash));
      signer.addSignature(
        index,
        {
          partialSig: {
            pubkey: key.publicKey,
            signature: bscript.signature.encode(signature, sighash),
          },
        },
        sigValidator
      );
    }
    return signer.pset.toBase64();
  }

  finalizeAndExtract(psetBase64: string): string {
    const pset = Pset.fromBase64(psetBase64);
    const finalizer = new Finalizer(pset);
    finalizer.finalize();
    return Extractor.extract(finalizer.pset).toHex();
  }
}
