import * as assert from 'assert';

import { decrypt, encrypt } from '../src/utils/crypto';

const PIN = '666666';
const data = 'secret data';

jest.setTimeout(15000);

describe('encryption', () => {
  it('should encrypt and decrypt data using a 6-digits PIN', async () => {
    const encrypted = await encrypt(data, PIN);
    const decrypted = await decrypt(encrypted, PIN);
    assert.deepStrictEqual(decrypted, data);
  });
});
