/// <reference types="jest" />

import type {AddressInterface} from 'ldk';
import {fetchAndUnblindUtxos} from 'ldk';
import type {PutEffect, StrictEffect} from 'redux-saga/effects';
import type {UnblindedOutput} from 'tdex-sdk';

import {SET_UTXO, DELETE_UTXO, RESET_UTXOS} from '../../src/redux/actions/walletActions';
import {toStringOutpoint} from '../../src/redux/reducers/walletReducer';
import {fetchAndUpdateUtxos} from '../../src/redux/sagas/walletSaga';
import type {ActionType} from '../../src/utils/types';
import {faucet, firstAddress, APIURL, sleep} from '../test-utils';

jest.setTimeout(15000);

describe('wallet saga', () => {
  describe('fetchAndUpdateUtxos', () => {
    let utxo: UnblindedOutput;
    let addr: AddressInterface;
    beforeAll(async () => {
      addr = await firstAddress;
      await sleep(5000);
      const txid = await faucet(addr.confidentialAddress);
      utxo = (await fetchAndUnblindUtxos([addr], APIURL, (utxo) => utxo.txid !== txid))[0];
    });

    test('should discover and add utxo', async () => {
      // simulate the first call
      const gen = fetchAndUpdateUtxos([addr], {}, APIURL);
      const setIsFetchingMarkets = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingMarkets.payload.action.payload).toEqual(true);
      const callEffect = gen.next().value as StrictEffect<IteratorResult<UnblindedOutput, number>>;
      const result = await callEffect.payload.fn();
      const put = gen.next(result).value as PutEffect<ActionType>;
      expect(put.payload.action.payload.value).toEqual(100000000);
      expect(put.payload.action.type).toEqual(SET_UTXO);
    });

    test('should delete existing utxo if spent', async () => {
      const current: Record<string, UnblindedOutput> = {};
      current['fakeTxid:8'] = utxo;
      const gen = fetchAndUpdateUtxos([addr], current, APIURL);
      let next = gen.next();
      while (next.value?.type !== 'PUT' || next.value?.payload.action.type !== 'DELETE_UTXO') {
        if (next.done) break;
        if (next.value.type === 'CALL') {
          const result = await next.value.payload.fn();
          next = gen.next(result);
          continue;
        }
        next = gen.next();
      }
      expect(next.value?.payload.action.type).toEqual(DELETE_UTXO);
      expect(toStringOutpoint(next.value?.payload.action.payload)).toEqual('fakeTxid:8');
    });

    test('should reset utxos if no utxos are discovered', async () => {
      const current: Record<string, UnblindedOutput> = {};
      current[toStringOutpoint(utxo)] = utxo;
      const gen = fetchAndUpdateUtxos([], current, APIURL);
      const setIsFetchingMarkets = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingMarkets.payload.action.payload).toEqual(true);
      const callEffect = gen.next().value as StrictEffect<IteratorResult<UnblindedOutput, number>>;
      const result = await callEffect.payload.fn();
      const put = gen.next(result).value as PutEffect<ActionType>;
      expect(put.payload.action.type).toEqual(RESET_UTXOS);
    });
  });
});
