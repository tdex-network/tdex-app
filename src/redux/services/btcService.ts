import axios from 'axios';
import type { BIP32Interface } from 'bip32';
import * as bip32 from 'bip32';
import * as btclib from 'bitcoinjs-lib';
import type { AddressInterface, Mnemonic } from 'ldk';
import {
  confidential,
  ECPair,
  script as bscript,
  Transaction,
} from 'liquidjs-lib';
import type { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import ElementsPegin from 'pegin';
import { getNetwork } from 'tdex-sdk';

import { FEDPEGSCRIPT_CUSTOM, LBTC_ASSET } from '../../utils/constants';
import { network } from '../config';
import type { Pegins } from '../reducers/btcReducer';

import { broadcastTx } from './walletService';

export async function getPeginModule(): Promise<ElementsPegin> {
  let peginModule: ElementsPegin;
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
      ElementsPegin.withTestnet(LBTC_ASSET.assetHash),
      ElementsPegin.withFederationScript(FEDPEGSCRIPT_CUSTOM),
    );
  }
  return peginModule;
}

export async function claimPegin(
  explorerBitcoinUrl: string,
  explorerUrl: string,
  pegins: Pegins,
  mnemonic: Mnemonic,
): Promise<Pegins> {
  let claimedPegins: Pegins = {};
  const peginModule = await getPeginModule();
  for (const claimScript in pegins) {
    if (Object.prototype.hasOwnProperty.call(pegins, claimScript)) {
      const pegin = pegins[claimScript];
      for (const outpoint in pegin.depositUtxos) {
        if (
          Object.prototype.hasOwnProperty.call(pegin.depositUtxos, outpoint)
        ) {
          const depositUtxo = pegin.depositUtxos[outpoint];
          // Skip if pegin has no deposit utxo or utxo is already claimed
          if (
            (pegin?.depositUtxos &&
              Object.keys(pegin.depositUtxos).length === 0) ||
            !depositUtxo.claimTxId
          ) {
            try {
              const ecPair = generateSigningPrivKey(
                mnemonic,
                pegins[claimScript].depositAddress.derivationPath,
              );
              const btcPeginTxHex = (
                await axios.get(
                  `${explorerBitcoinUrl}/tx/${depositUtxo.txid}/hex`,
                )
              ).data;
              const btcBlockProof = (
                await axios.get(
                  `${explorerBitcoinUrl}/tx/${depositUtxo.txid}/merkleblock-proof`,
                )
              ).data;
              const claimTxHex = await peginModule.claimTx(
                btcPeginTxHex,
                btcBlockProof,
                claimScript,
              );
              const signedClaimTxHex = signClaimTx(
                claimTxHex,
                btcPeginTxHex,
                claimScript,
                ecPair,
              );
              const claimTxId = await broadcastTx(
                signedClaimTxHex,
                explorerUrl,
              );
              pegin.depositUtxos[outpoint] = {
                ...depositUtxo,
                claimTxId: claimTxId,
              };
              claimedPegins = Object.assign({}, claimedPegins, {
                [claimScript]: {
                  depositAddress: pegin.depositAddress,
                  depositUtxos: pegin.depositUtxos,
                },
              });
            } catch (err) {
              // Prevent propagating error to caller to allow failure of claims but still return the claimTxs that succeeded
              console.error(err);
            }
          }
        }
      }
    }
  }
  return claimedPegins;
}

export async function searchPeginDepositAddresses(
  addresses: Record<string, AddressInterface>,
  peginAddressSearch: string,
): Promise<Pegins | undefined> {
  const peginModule = await getPeginModule();
  const pegins: Pegins = {};
  const addrs = Object.entries(addresses).reverse();
  for (const [claimScript, { derivationPath }] of addrs) {
    const peginAddress = await peginModule.getMainchainAddress(claimScript);
    if (peginAddressSearch === peginAddress) {
      pegins[claimScript] = {
        depositAddress: {
          address: peginAddress,
          claimScript: claimScript,
          derivationPath: derivationPath ?? '',
        },
      };
    }
  }
  if (Object.keys(pegins).length) {
    if (Object.values(pegins)[0].depositAddress.derivationPath === '')
      throw new Error('Claim data must contain derivation path');
    return pegins;
  } else {
    return undefined;
  }
}

function generateSigningPrivKey(
  mnemonic: Mnemonic,
  derivationPath: string,
): ECPairInterface {
  const node: BIP32Interface = bip32.fromBase58(
    mnemonic.masterPrivateKeyNode.toBase58(),
    getNetwork(network.chain),
  );
  const child: BIP32Interface = node.derivePath(derivationPath);
  return ECPair.fromWIF(child.toWIF(), getNetwork(network.chain));
}

function signClaimTx(
  claimTxHex: string,
  btcPeginTxHex: string,
  claimScript: string,
  ecPair: ECPairInterface,
): string {
  const transaction = Transaction.fromHex(claimTxHex);
  const prevoutTx = btclib.Transaction.fromHex(btcPeginTxHex);
  const amountPegin = prevoutTx.outs[transaction.ins[0].index].value;
  const sigHash = transaction.hashForWitnessV0(
    0,
    Buffer.from(ElementsPegin.claimScriptToP2PKHScript(claimScript), 'hex'),
    confidential.satoshiToConfidentialValue(amountPegin),
    Transaction.SIGHASH_ALL,
  );
  const sig = ecPair.sign(sigHash);
  const signatureWithHashType = bscript.signature.encode(
    sig,
    Transaction.SIGHASH_ALL,
  );
  transaction.ins[0].witness = [signatureWithHashType, ecPair.publicKey];
  return transaction.toHex();
}
