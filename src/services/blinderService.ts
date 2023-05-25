import zkp from '@vulpemventures/secp256k1-zkp';
import { Blinder, Pset, ZKPGenerator, ZKPValidator } from 'liquidjs-lib';

import { psetToBlindingPrivateKeys } from '../utils/transaction';

export class BlinderService {
  async blindPset(pset: Pset): Promise<Pset> {
    const zkpLib = await zkp();
    const { ecc } = zkpLib;
    const zkpValidator = new ZKPValidator(zkpLib);
    const blindingKeys = psetToBlindingPrivateKeys(pset);
    const zkpGenerator = new ZKPGenerator(zkpLib, ZKPGenerator.WithBlindingKeysOfInputs(blindingKeys));
    const ownedInputs = zkpGenerator.unblindInputs(pset);
    const keysGenerator = Pset.ECCKeysGenerator(ecc);
    const outputBlindingArgs = zkpGenerator.blindOutputs(pset, keysGenerator);
    const blinder = new Blinder(pset, ownedInputs, zkpValidator, zkpGenerator);
    blinder.blindLast({ outputBlindingArgs });
    return blinder.pset;
  }
}
