import { AddressInterface, TxInterface } from 'ldk';
import { ActionType } from './../../src/utils/types';
import { CallEffect, PutEffect } from 'redux-saga/effects';
import { faucet, firstAddress, APIURL, sleep } from '../test-utils';
import { fetchAndUpdateTxs } from '../../src/redux/sagas/transactionsSaga';
import { SET_TRANSACTION } from '../../src/redux/actions/transactionsActions';

jest.setTimeout(15000)

describe('Transaction saga', () => {
    describe('fetchAndUpdateTxs', () => {
        let txid: string;
        beforeAll(async () => {
            txid = await faucet(firstAddress.confidentialAddress)
        })

        test('should discover and add new transaction', async () => {
            const gen = fetchAndUpdateTxs([firstAddress], {}, APIURL)
            // simulate the first call
            const callEffect = gen.next().value as CallEffect<IteratorResult<TxInterface, number>>
            const result = await callEffect.payload.fn()
            // get the put effect
            const put = gen.next(result).value as PutEffect<ActionType>

            expect(put.payload.action.type).toEqual(SET_TRANSACTION)
        })

        test('should skip if no tx to discover', async () => {
            const gen = fetchAndUpdateTxs([], {}, APIURL)
            // simulate the first call
            const callEffect = gen.next().value as CallEffect<IteratorResult<TxInterface, number>>
            const result = await callEffect.payload.fn()
            expect(gen.next(result).done).toEqual(true)
        })
    })
})