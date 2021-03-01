import {
  getMnemonicFromSecureStorage,
  setMnemonicInSecureStorage,
} from '../src/utils/storage-helper';

describe('storage helpers', () => {
  describe('secure storage and crypto', () => {
    test('it should encrypt mnemonic', async () => {
      const mnemonic = 'test mnemonic';
      const pin = '666666';
      await setMnemonicInSecureStorage(mnemonic, pin);
      const mnemonicResult = await getMnemonicFromSecureStorage(pin);
      expect(mnemonicResult).toEqual(mnemonic);
    });
  });
});
