import secp256k1 from '@vulpemventures/secp256k1-zkp';
import type {AddressInterface} from "ldk";
import { PrivateKey, IdentityType } from 'tdex-sdk';
import * as ecc from 'tiny-secp256k1';


export const privKeyIdentity = async (): Promise<PrivateKey> => {
  const zkpLib = await secp256k1();
  return new PrivateKey({
    chain: 'regtest',
    type: IdentityType.PrivateKey,
    opts: {
      signingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
      blindingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
    },
    ecclib: ecc,
    zkplib: zkpLib,
  });
}

export const firstAddress = async (): Promise<AddressInterface> => {
  const id = await privKeyIdentity()
  return id.getNextAddress();
}
