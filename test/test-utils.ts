import { PrivateKey, IdentityType } from 'tdex-sdk';
import * as ecc from 'tiny-secp256k1';

export const privKeyIdentity = new PrivateKey({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  opts: {
    signingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    blindingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
  ecclib: ecc,
});

export const firstAddress = privKeyIdentity.getNextAddress();
