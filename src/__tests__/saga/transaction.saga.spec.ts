/** @jest-environment node */
/// <reference types="jest" />

import type { TxInterface, AddressInterface } from 'ldk';
import { address } from 'ldk';
import type { CallEffect, PutEffect } from 'redux-saga/effects';

import { faucet, firstAddress, APIURL, sleep } from '../../../test/test-utils';
import { SET_TRANSACTION } from '../../redux/actions/transactionsActions';
import { fetchAndUpdateTxs } from '../../redux/sagas/transactionsSaga';
import type { ActionType } from '../../utils/types';

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
          [address.toOutputScript(addr.confidentialAddress).toString('hex')]: addr,
        },
        {},
        APIURL
      );
      const setIsFetchingTransactions = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingTransactions.payload.action.payload).toEqual(true);
      const callEffect = gen.next().value as CallEffect<IteratorResult<TxInterface, number>>;
      const result = await callEffect.payload.fn();
      const put = gen.next(result).value as PutEffect<ActionType>;
      expect(put.payload.action.type).toEqual(SET_TRANSACTION);
      expect(put.payload.action.payload).toHaveProperty('txid');
      const tx = await gen.next(result).value.payload.fn();
      expect(gen.next(tx).value.payload.action.type).toEqual('SET_TRANSACTION');
    });

    test('should skip if no tx to discover', async () => {
      const gen = fetchAndUpdateTxs([], {}, {}, APIURL);
      const setIsFetchingTransactions = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingTransactions.payload.action.payload).toEqual(true);
      const callEffect = gen.next().value as CallEffect<IteratorResult<TxInterface, number>>;
      const result = await callEffect.payload.fn();
      // setIsFetchingTransactions(false)
      expect(gen.next(result).value.payload.action.payload).toEqual(false);
      expect(gen.next(result).done).toEqual(true);
    });
  });
});
