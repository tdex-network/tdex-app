/// <reference types="jest" />

import type { AddressInterface } from 'ldk';
import { fetchAndUnblindUtxos } from 'ldk';
import type { PutEffect, StrictEffect } from 'redux-saga/effects';
import type { UnblindedOutput } from 'tdex-sdk';
import { getSats } from 'tdex-sdk';
import * as ecc from 'tiny-secp256k1';

import { faucet, firstAddress, APIURL, sleep } from '../../../test/test-utils';
import { SET_UTXO, DELETE_UTXO } from '../../redux/actions/walletActions';
import { outpointToString } from '../../redux/reducers/walletReducer';
import { fetchAndUpdateUtxos } from '../../redux/sagas/walletSaga';
import type { ActionType } from '../../utils/types';

jest.setTimeout(15000);

describe('wallet saga', () => {
  describe('fetchAndUpdateUtxos', () => {
    let utxo: UnblindedOutput;
    let addr: AddressInterface;
    beforeAll(async () => {
      addr = await firstAddress;
      await sleep(5000);
      const txid = await faucet(addr.confidentialAddress);
      utxo = (await fetchAndUnblindUtxos(ecc, [addr], APIURL, (utxo) => utxo.txid !== txid))[0];
    });

    test('should discover and add utxo', async () => {
      const gen = fetchAndUpdateUtxos([addr], {}, APIURL);
      const setIsFetchingMarkets = gen.next().value as PutEffect<ActionType<boolean>>;
      expect(setIsFetchingMarkets.payload.action.payload).toEqual(true);
      const callEffect = gen.next().value as StrictEffect<IteratorResult<UnblindedOutput, number>>;
      const result = await callEffect.payload.fn();
      const put = gen.next(result).value as PutEffect<ActionType>;
      expect(getSats(put.payload.action.payload)).toEqual(100000000);
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
      expect(outpointToString(next.value?.payload.action.payload)).toEqual('fakeTxid:8');
    });
  });
});
