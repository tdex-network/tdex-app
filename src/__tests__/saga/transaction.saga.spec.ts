/** @jest-environment node */
/// <reference types="jest" />

import type { TxInterface, AddressInterface } from 'ldk';
import { address } from 'ldk';
import type { CallEffect, PutEffect } from 'redux-saga/effects';

import faucet, { APIURL } from '../../../test/faucet';
import { firstAddress } from '../../../test/test-utils';
import { SET_TRANSACTION } from '../../redux/actions/transactionsActions';
import { config } from '../../redux/config';
import { fetchAndUpdateTxs } from '../../redux/sagas/transactionsSaga';
import { sleep } from '../../utils/helpers';
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
        APIURL,
        config.explorers.electrsBatchAPI
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
      const gen = fetchAndUpdateTxs(
        ['el1qq2cwwnqhgcwpwy2w7wmqdsf7w5yduzjnyv5723qxnzrkaadcnrvqms0zymen4hckr6st9g2dk7rnm5xs8jwvqhqjujzseynj0'],
        {},
        {},
        APIURL,
        config.explorers.electrsBatchAPI
      );
      const setIsFetchingTransactions = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingTransactions.payload.action.payload).toEqual(true);
      const callEffect = gen.next().value as CallEffect<IteratorResult<TxInterface, number>>;
      const result = await callEffect.payload.fn();
      // This corresponds to setIsFetchingTransactions(false) call
      expect(gen.next(result).value.payload.action.payload).toEqual(false);
      expect(gen.next(result).done).toEqual(true);
    });

    test('should not call txsFetchGenerator if no addresses', async () => {
      const gen = fetchAndUpdateTxs([], {}, {}, APIURL, config.explorers.electrsBatchAPI);
      const setIsFetchingTransactions = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingTransactions.payload.action.payload).toEqual(true);
      const setIsFetchingTransactions2 = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingTransactions2.payload.action.payload).toEqual(false);
    });
  });
});
