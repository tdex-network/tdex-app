import axios from 'axios';
import type { BIP32Interface } from 'bip32';
import * as bip32 from 'bip32';
import * as btclib from 'bitcoinjs-lib';
import type { Mnemonic } from 'ldk';
import {
  confidential,
  ECPair,
  script as bscript,
  Transaction,
} from 'liquidjs-lib';
import ElementsPegin from 'pegin';
import type { Dispatch } from 'redux';
import { getNetwork } from 'tdex-sdk';

import { addErrorToast, addSuccessToast } from '../redux/actions/toastActions';
import { network } from '../redux/config';
import type { WalletState } from '../redux/reducers/walletReducer';
import { broadcastTx } from '../redux/services/walletService';

import { ClaimPeginError } from './errors';
import { sleep } from './helpers';

export async function claimPegin(
  explorerBitcoinUrl: string,
  explorerUrl: string,
  peginAddresses: WalletState['peginAddresses'],
  mnemonic: Mnemonic,
  dispatch: Dispatch,
  managePinSuccess: any,
  managePinError: any,
): Promise<string[]> {
  if (!Object.values(peginAddresses).length) {
    dispatch(
      addSuccessToast(`No pegin addresses have been found in this wallet`),
    );
    managePinSuccess();
    await sleep(1500);
    return [];
  }
  const claimTxs: string[] = [];
  try {
    let peginModule;
    if (network.chain === 'liquid') {
      peginModule = new ElementsPegin(
        await ElementsPegin.withGoElements(),
        await ElementsPegin.withLibwally(),
      );
    } else {
      peginModule = new ElementsPegin(
        await ElementsPegin.withGoElements(),
        await ElementsPegin.withLibwally(),
        ElementsPegin.withDynamicFederation(false),
        ElementsPegin.withTestnet(),
        ElementsPegin.withFederationScript('51'),
      );
    }
    for (const claimScript in peginAddresses) {
      if (Object.prototype.hasOwnProperty.call(peginAddresses, claimScript)) {
        // Get pegin txs for each pegin address in state
        const btcPeginTxs = (
          await axios.get(
            `${explorerBitcoinUrl}/address/${peginAddresses[claimScript].peginAddress}/txs`,
          )
        ).data;
        if (btcPeginTxs.length) {
          for (const btcPeginTx of btcPeginTxs) {
            const btcPeginTxHex = (
              await axios.get(`${explorerBitcoinUrl}/tx/${btcPeginTx.txid}/hex`)
            ).data;
            // Get Merkle block proof for each tx
            const btcBlockProof = (
              await axios.get(
                `${explorerBitcoinUrl}/tx/${btcPeginTx?.txid}/merkleblock-proof`,
              )
            ).data;
            // Construct claim tx
            let claimTxHex = await peginModule.claimTx(
              btcPeginTxHex,
              btcBlockProof,
              claimScript,
            );
            // Generate signing privKey
            const node: BIP32Interface = bip32.fromBase58(
              mnemonic.masterPrivateKeyNode.toBase58(),
              getNetwork(network.chain),
            );
            const child: BIP32Interface = node.derivePath(
              peginAddresses[claimScript].derivationPath,
            );
            const ecPair = ECPair.fromWIF(
              child.toWIF(),
              getNetwork(network.chain),
            );
            // Sign
            const transaction = Transaction.fromHex(claimTxHex);
            const prevoutTx = btclib.Transaction.fromHex(btcPeginTxHex);
            const amountPegin = prevoutTx.outs[transaction.ins[0].index].value;
            const sigHash = transaction.hashForWitnessV0(
              0,
              Buffer.from(
                ElementsPegin.claimScriptToP2PKHScript(claimScript),
                'hex',
              ),
              confidential.satoshiToConfidentialValue(amountPegin),
              Transaction.SIGHASH_ALL,
            );

            const sig = ecPair.sign(sigHash);
            const signatureWithHashType = bscript.signature.encode(
              sig,
              Transaction.SIGHASH_ALL,
            );
            transaction.ins[0].witness = [
              signatureWithHashType,
              ecPair.publicKey,
            ];
            claimTxHex = transaction.toHex();
            // Broadcast
            const txid = await broadcastTx(claimTxHex, explorerUrl);
            claimTxs[claimTxs.length] = txid;
            // TODO: https://github.com/vulpemventures/ldk/issues/71
            //dispatch(watchTransaction(txid));
            dispatch(addSuccessToast(`Claim Transaction broadcasted`));
            managePinSuccess();
          }
        } else {
          managePinError();
          dispatch(
            addSuccessToast(
              `No pending claim transactions have been found for address ${peginAddresses[claimScript]}`,
            ),
          );
        }
      }
    }
  } catch (err) {
    console.error(err);
    managePinError();
    dispatch(addErrorToast(ClaimPeginError));
  }
  return claimTxs;
}
