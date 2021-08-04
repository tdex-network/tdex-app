import axios from 'axios';
import type { BIP32Interface } from 'bip32';
import * as bip32 from 'bip32';
import * as btclib from 'bitcoinjs-lib';
import type { Mnemonic, AddressInterface } from 'ldk';
import {
  confidential,
  ECPair,
  script as bscript,
  Transaction,
} from 'liquidjs-lib';
import type { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import ElementsPegin from 'pegin';
import { getNetwork } from 'tdex-sdk';

import { network } from '../redux/config';
import type { DepositPeginUtxo, Pegins } from '../redux/reducers/btcReducer';
import { broadcastTx } from '../redux/services/walletService';

export async function claimPegin(
  explorerBitcoinUrl: string,
  explorerUrl: string,
  pegins: Pegins,
  mnemonic: Mnemonic,
): Promise<Pegins> {
  let claimedPegins: Pegins = {};
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
      ElementsPegin.withTestnet(),
      ElementsPegin.withFederationScript('51'),
    );
  }
  for (const claimScript in pegins) {
    if (Object.prototype.hasOwnProperty.call(pegins, claimScript)) {
      // Skip if pegin is already claimed
      if (!pegins[claimScript].claimTxId) {
        try {
          // Get pegin txs for each pegin address in state
          // Warning: In Regtest same pegin address is used in all pegins
          // So final `claimedPegins` only contains update data of last pegin in pegins array
          const btcPeginUtxos: DepositPeginUtxo[] = (
            await axios.get(
              `${explorerBitcoinUrl}/address/${pegins[claimScript].depositAddress.address}/utxo`,
            )
          ).data;
          if (btcPeginUtxos.length === 0)
            console.log(
              `No pending claim transactions have been found for address ${pegins[claimScript].depositAddress.address}`,
            );
          const ecPair = generateSigningPrivKey(
            mnemonic,
            pegins[claimScript].depositAddress.derivationPath,
          );
          for (const btcPeginUtxo of btcPeginUtxos) {
            const btcPeginTxHex = (
              await axios.get(
                `${explorerBitcoinUrl}/tx/${btcPeginUtxo.txid}/hex`,
              )
            ).data;
            const btcBlockProof = (
              await axios.get(
                `${explorerBitcoinUrl}/tx/${btcPeginUtxo.txid}/merkleblock-proof`,
              )
            ).data;
            const claimTxHex = await peginModule.claimTx(
              btcPeginTxHex,
              btcBlockProof,
              claimScript,
            );
            const signedClaimedTxHex = signTx(
              claimTxHex,
              btcPeginTxHex,
              claimScript,
              ecPair,
            );
            const claimTxId = await broadcastTx(
              signedClaimedTxHex,
              explorerUrl,
            );
            if (btcPeginUtxo.value === 0)
              throw new Error('Failure to retrieve pegin deposit amount');
            claimedPegins = Object.assign({}, claimedPegins, {
              [claimScript]: {
                claimTxId: claimTxId,
                depositAddress: pegins[claimScript].depositAddress,
                depositAmount: btcPeginUtxo.value,
                depositTxId: btcPeginUtxo.txid,
                depositVout: btcPeginUtxo.vout,
                depositBlockHeight: btcPeginUtxo.status.block_height,
              },
            });
          }
        } catch (err) {
          // Prevent propagating error to caller to allow failure of claims but still return the claimTxs that succeeded
          console.error(err);
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
  let peginModule: ElementsPegin;
  const pegins: Pegins = {};
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

function signTx(
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
