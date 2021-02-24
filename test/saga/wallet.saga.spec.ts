import { fetchAndUnblindUtxos, UtxoInterface } from 'ldk';
import { ActionType } from './../../src/utils/types';
import { CallEffect, PutEffect } from 'redux-saga/effects';
import { fetchAndUpdateUtxos } from '../../src/redux/sagas/walletSaga';
import { faucet, firstAddress, APIURL, sleep } from '../test-utils';
import { SET_UTXO, DELETE_UTXO, RESET_UTXOS } from '../../src/redux/actions/walletActions';
import { outpointToString } from '../../src/redux/reducers/walletReducer';

jest.setTimeout(15000)

describe('wallet saga', () => {
    describe('fetchAndUpdateUtxos', () => {
        let utxo: UtxoInterface;
        beforeAll(async () => {
            await sleep(5000)
            const txid = await faucet(firstAddress.confidentialAddress)
            utxo = (await fetchAndUnblindUtxos([firstAddress], APIURL, (utxo) => utxo.txid !== txid))[0]
        })

        test('should discover and add utxo', async () => {
            const gen = fetchAndUpdateUtxos([firstAddress], {}, APIURL)
            // simulate the first call
            const callEffect = gen.next().value as CallEffect<IteratorResult<UtxoInterface, number>>
            const result = await callEffect.payload.fn()
            const put = gen.next(result).value as PutEffect<ActionType>

            expect(put.payload.action.type).toEqual(SET_UTXO)
        })

        test('should delete existing utxo if spent', async () => {
            const current: Record<string, UtxoInterface> = {}
            current['fakeTxid:8'] = utxo
            const gen = fetchAndUpdateUtxos([firstAddress], current, APIURL)

            let next = gen.next();
            while (next.value.type !== 'PUT' || next.value.payload.action.type !== 'DELETE_UTXO') {
                if (next.done) break;
                if (next.value.type === 'CALL') {
                    const result = await next.value.payload.fn()
                    next = gen.next(result)
                    continue
                }

                next = gen.next()
            }

            expect(next.value.payload.action.type).toEqual(DELETE_UTXO)
            expect(outpointToString(next.value.payload.action.payload)).toEqual('fakeTxid:8')
        })

        test('should reset utxos if no utxos are discovered', async () => {
            const current: Record<string, UtxoInterface> = {}
            current[outpointToString(utxo)] = utxo
            const gen = fetchAndUpdateUtxos([], current, APIURL)

            const callEffect = gen.next().value as CallEffect<IteratorResult<UtxoInterface, number>>
            const result = await callEffect.payload.fn()
            const put = gen.next(result).value as PutEffect<ActionType>

            expect(put.payload.action.type).toEqual(RESET_UTXOS)
        })
    })
})