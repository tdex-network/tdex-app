/// <reference types="jest" />

import type { TxInterface, AddressInterface } from 'ldk';
import { address } from 'ldk';
import type { CallEffect, PutEffect } from 'redux-saga/effects';

import { SET_TRANSACTION } from '../../src/redux/actions/transactionsActions';
import { fetchAndUpdateTxs } from '../../src/redux/sagas/transactionsSaga';
import type { ActionType } from '../../src/utils/types';
import { faucet, firstAddress, APIURL, sleep } from '../test-utils';

jest.setTimeout(15000);

describe('Transaction saga', () => {
  describe('fetchAndUpdateTxs', () => {
    let addr: AddressInterface;

    beforeAll(async () => {
      addr = await firstAddress;
      await sleep(5000);
      await faucet(addr.confidentialAddress);
    });

    test('should discover and add new transaction', async () => {
      const gen = fetchAndUpdateTxs(
        [addr.confidentialAddress],
        {
          [address.toOutputScript(addr.confidentialAddress).toString('hex')]:
            addr,
        },
        {},
        APIURL,
      );
      // simulate the first call
      const callEffect = gen.next().value as CallEffect<
        IteratorResult<TxInterface, number>
      >;
      const result = await callEffect.payload.fn();
      // get the put effect
      const put = gen.next(result).value as PutEffect<ActionType>;

      expect(put.payload.action.type).toEqual(SET_TRANSACTION);
    });

    test('should skip if no tx to discover', async () => {
      const gen = fetchAndUpdateTxs([], {}, {}, APIURL);
      // simulate the first call
      const callEffect = gen.next().value as CallEffect<
        IteratorResult<TxInterface, number>
      >;
      const result = await callEffect.payload.fn();
      expect(gen.next(result).done).toEqual(true);
    });
  });
});
