import axios from 'axios';
import { PrivateKey, IdentityType } from 'tdex-sdk';
import * as ecc from 'tiny-secp256k1';

export const fakePrices = {
  '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225': 45000,
};

export const APIURL = process.env.EXPLORER || `http://localhost:3001`;

export async function faucet(address: string, amount?: number, asset?: string): Promise<any> {
  try {
    const { status, data } = await axios.post(`${APIURL}/faucet`, {
      address,
      amount,
      asset,
    });
    if (status !== 200) {
      throw new Error('faucet network error: ' + status);
    }
    const { txId } = data;
    await sleep(5000);
    return txId;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// KEY PAIRS
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

export function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
