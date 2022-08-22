/** @jest-environment node */
/// <reference types="jest" />

import type { AddressInterface } from 'ldk';
import { address } from 'ldk';
import type { PutEffect, StrictEffect } from 'redux-saga/effects';
import type { UnblindedOutput } from 'tdex-sdk';
import { ElectrsBatchServer, fetchAllUtxos, getSats } from 'tdex-sdk';

import { firstAddress, APIURL, sleep, faucet } from '../../../test/test-utils';
import { SET_UTXO, DELETE_UTXO } from '../../redux/actions/walletActions';
import { network } from '../../redux/config';
import { outpointToString } from '../../redux/reducers/walletReducer';
import { fetchAndUpdateUtxos } from '../../redux/sagas/walletSaga';
import { blindingKeyGetterFactory } from '../../utils/helpers';
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
      const api = ElectrsBatchServer.fromURLs(network.electrsBatchAPI, APIURL);
      const blindingKeyGetter = blindingKeyGetterFactory({
        [address.toOutputScript(addr.confidentialAddress).toString('hex')]: addr,
      });
      const utxos = await fetchAllUtxos([addr.confidentialAddress], async (script) => blindingKeyGetter(script), api);
      const utxoTmp = utxos.find((utxo) => utxo.txid === txid);
      if (utxoTmp) {
        utxo = utxoTmp;
      } else {
        throw new Error('faucet utxo not found');
      }
    });

    test('should discover and add utxo', async () => {
      const gen = fetchAndUpdateUtxos(
        {
          [address.toOutputScript(addr.confidentialAddress).toString('hex')]: addr,
        },
        {},
        APIURL,
        network.electrsBatchAPI
      );
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
      const gen = fetchAndUpdateUtxos(
        {
          [address.toOutputScript(addr.confidentialAddress).toString('hex')]: addr,
        },
        current,
        APIURL,
        network.electrsBatchAPI
      );
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
