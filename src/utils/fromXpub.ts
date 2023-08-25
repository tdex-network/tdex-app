import b58 from 'bs58check';

import type { NetworkString } from './constants';

// This has been taken from https://github.com/Casa/xpub-converter/blob/master/js/xpubConvert.js
/*
  This script uses version bytes as described in SLIP-132
  https://github.com/satoshilabs/slips/blob/master/slip-0132.md
*/
const prefixes = new Map([
  ['xpub', '0488b21e'],
  ['ypub', '049d7cb2'],
  ['Ypub', '0295b43f'],
  ['zpub', '04b24746'],
  ['Zpub', '02aa7ed3'],
  ['tpub', '043587cf'],
  ['upub', '044a5262'],
  ['Upub', '024289ef'],
  ['vpub', '045f1cf6'],
  ['Vpub', '02575483'],
]);

function changeVersionBytes(xpub: string, targetFormat: string) {
  if (!prefixes.has(targetFormat)) {
    return 'Invalid target version';
  }

  // trim whitespace
  xpub = xpub.trim();

  try {
    let data = b58.decode(xpub);
    data = data.slice(4);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data = Buffer.concat([Buffer.from(prefixes.get(targetFormat)!, 'hex'), data]);
    return b58.encode(data);
  } catch (err) {
    throw new Error("Invalid extended public key! Please double check that you didn't accidentally paste extra data.");
  }
}

export function fromXpub(xpub: string, chain: NetworkString): string {
  const format = chain === 'liquid' ? 'zpub' : 'vpub';
  return changeVersionBytes(xpub, format);
}

export function toXpub(anyPub: string): string {
  return changeVersionBytes(anyPub, 'xpub');
}
