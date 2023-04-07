import zkp from '@vulpemventures/secp256k1-zkp';
import { Blinder, Pset, ZKPGenerator, ZKPValidator } from 'liquidjs-lib';
import * as ecc from 'tiny-secp256k1';

import { psetToOwnedInputs } from '../utils/transaction';

const keysGenerator = Pset.ECCKeysGenerator(ecc);

export class BlinderService {
  async blindPset(pset: Pset): Promise<Pset> {
    const zkpLib = await zkp();
    const zkpValidator = new ZKPValidator(zkpLib);
    const { ownedInputs } = psetToOwnedInputs(pset);
    const zkpGenerator = new ZKPGenerator(zkpLib, ZKPGenerator.WithOwnedInputs(ownedInputs));
    const outputBlindingArgs = zkpGenerator.blindOutputs(pset, keysGenerator);
    const blinder = new Blinder(pset, ownedInputs, zkpValidator, zkpGenerator);
    blinder.blindLast({ outputBlindingArgs });
    return blinder.pset;
  }
}
