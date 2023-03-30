import zkp from '@vulpemventures/secp256k1-zkp';
import { Blinder, Pset, ZKPGenerator, ZKPValidator } from 'liquidjs-lib';
import * as ecc from 'tiny-secp256k1';

import { psetToOwnedInputs } from '../utils/transaction';

const keysGenerator = Pset.ECCKeysGenerator(ecc);

export class BlinderService {
  async blindPset(pset: Pset): Promise<Pset> {
    const zkpLib = await zkp();
    const zkpValidator = new ZKPValidator(zkpLib);
    const { ownedInputs, inputIndexes } = psetToOwnedInputs(pset);
    const zkpGenerator = new ZKPGenerator(zkpLib, ZKPGenerator.WithOwnedInputs(ownedInputs));
    const outputBlindingArgs = zkpGenerator.blindOutputs(pset, keysGenerator);
    let isLast = true;
    for (const out of pset.outputs) {
      if (out.isFullyBlinded()) continue;
      if (out.needsBlinding() && out.blinderIndex) {
        if (!inputIndexes.includes(out.blinderIndex)) {
          isLast = false;
          break;
          // if it remains an output to blind, it means that we are not the last blinder
        }
      }
    }
    const blinder = new Blinder(pset, ownedInputs, zkpValidator, zkpGenerator);
    if (isLast) {
      blinder.blindLast({ outputBlindingArgs });
    } else {
      blinder.blindNonLast({ outputBlindingArgs });
    }
    return blinder.pset;
  }
}
