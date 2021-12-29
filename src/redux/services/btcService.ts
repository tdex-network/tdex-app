import axios from 'axios';
import type { BIP32Interface } from 'bip32';
import * as bip32 from 'bip32';
import * as btclib from 'bitcoinjs-lib';
import type { Mnemonic } from 'ldk';
import { confidential, ECPair, script as bscript, Transaction } from 'liquidjs-lib';
import type { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import ElementsPegin from 'pegin';
import type { NetworkString } from 'tdex-sdk';
import { getNetwork } from 'tdex-sdk';

import { getFedPegScript, LBTC_ASSET } from '../../utils/constants';
import type { Pegins } from '../reducers/btcReducer';

import { broadcastTx } from './walletService';

export async function getPeginModule(network: NetworkString): Promise<ElementsPegin> {
  let peginModule: ElementsPegin;
  if (network === 'liquid') {
    peginModule = new ElementsPegin(await ElementsPegin.withGoElements(), await ElementsPegin.withLibwally());
  } else {
    peginModule = new ElementsPegin(
      await ElementsPegin.withGoElements(),
      await ElementsPegin.withLibwally(),
      ElementsPegin.withDynamicFederation(false),
      ElementsPegin.withTestnet(LBTC_ASSET[network].assetHash),
      ElementsPegin.withFederationScript(getFedPegScript(network))
    );
  }
  return peginModule;
}

export async function claimPegins(
  explorerBitcoinAPI: string,
  explorerLiquidAPI: string,
  pegins: Pegins,
  mnemonic: Mnemonic,
  currentBtcBlockHeight: number,
  network: NetworkString
): Promise<Pegins> {
  let claimedPegins: Pegins = {};
  const peginModule = await getPeginModule(network);
  for (const claimScript in pegins) {
    const pegin = pegins[claimScript];
    for (const outpoint in pegin?.depositUtxos) {
      const depositUtxo = pegin.depositUtxos[outpoint];
      const confirmations =
        depositUtxo.status.block_height && currentBtcBlockHeight - depositUtxo.status.block_height + 1;
      // Continue if utxo not claimed and claimable
      if (!depositUtxo.claimTxId && confirmations && confirmations >= 102) {
        try {
          const ecPair = generateSigningPrivKey(mnemonic, pegin.depositAddress.derivationPath, network);
          const btcPeginTxHex = (await axios.get(`${explorerBitcoinAPI}/tx/${depositUtxo.txid}/hex`)).data;
          const btcBlockProof = (await axios.get(`${explorerBitcoinAPI}/tx/${depositUtxo.txid}/merkleblock-proof`))
            .data;
          const claimTxHex = await peginModule.claimTx(btcPeginTxHex, btcBlockProof, claimScript);
          const signedClaimTxHex = signClaimTx(claimTxHex, btcPeginTxHex, claimScript, ecPair);
          const claimTxId = await broadcastTx(signedClaimTxHex, explorerLiquidAPI);
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
        } catch (err: any) {
          // Prevent propagating error to caller to allow failure of claims but still return the claimTxs that succeeded
          console.error(err);
          const open = err.response.data.indexOf('{');
          const close = err.response.data.lastIndexOf('}');
          const errJson = JSON.parse(err.response.data.substring(open, close + 1));
          console.error(errJson.message);
        }
      }
    }
  }
  return claimedPegins;
}

function generateSigningPrivKey(mnemonic: Mnemonic, derivationPath: string, network: NetworkString): ECPairInterface {
  const node: BIP32Interface = bip32.fromBase58(mnemonic.masterPrivateKeyNode.toBase58(), getNetwork(network));
  const child: BIP32Interface = node.derivePath(derivationPath);
  return ECPair.fromWIF(child.toWIF(), getNetwork(network));
}

function signClaimTx(claimTxHex: string, btcPeginTxHex: string, claimScript: string, ecPair: ECPairInterface): string {
  const transaction = Transaction.fromHex(claimTxHex);
  const prevoutTx = btclib.Transaction.fromHex(btcPeginTxHex);
  const amountPegin = prevoutTx.outs[transaction.ins[0].index].value;
  const sigHash = transaction.hashForWitnessV0(
    0,
    Buffer.from(ElementsPegin.claimScriptToP2PKHScript(claimScript), 'hex'),
    confidential.satoshiToConfidentialValue(amountPegin),
    Transaction.SIGHASH_ALL
  );
  const sig = ecPair.sign(sigHash);
  const signatureWithHashType = bscript.signature.encode(sig, Transaction.SIGHASH_ALL);
  transaction.ins[0].witness = [signatureWithHashType, ecPair.publicKey];
  return transaction.toHex();
}
