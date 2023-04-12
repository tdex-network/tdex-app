import axios from 'axios';
import type { BIP32Interface } from 'bip32';
import BIP32Factory from 'bip32';
import { mnemonicToSeed } from 'bip39';
import * as btclib from 'bitcoinjs-lib';
import type { ECPairInterface } from 'ecpair';
import ECPairFactory from 'ecpair';
import { confidential, script as bscript, Transaction } from 'liquidjs-lib';
import { getNetwork } from 'liquidjs-lib/src/address';
import ElementsPegin from 'pegin';
import * as ecc from 'tiny-secp256k1';

import type { DepositPeginUtxo, Pegins } from '../store/bitcoinStore';
import { useWalletStore } from '../store/walletStore';
import type { NetworkString } from '../utils/constants';
import { getFedPegScript, LBTC_ASSET } from '../utils/constants';
import { decrypt } from '../utils/crypto';

import { chainSource } from './chainSource';

const bip32 = BIP32Factory(ecc);

export class BitcoinService {
  private masterNode: BIP32Interface;

  constructor(masterNode: BIP32Interface) {
    this.masterNode = masterNode;
  }

  static async fromPin(pin: string): Promise<BitcoinService> {
    const encryptedMnemonic = useWalletStore.getState().encryptedMnemonic;
    if (!encryptedMnemonic) throw new Error('No mnemonic found in wallet');
    const decryptedMnemonic = await decrypt(encryptedMnemonic, pin);
    const masterNode = bip32.fromSeed(await mnemonicToSeed(decryptedMnemonic));
    return new BitcoinService(masterNode);
  }

  static async getPeginModule(network: NetworkString): Promise<ElementsPegin> {
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

  async claimPegins(
    explorerBitcoinAPI: string,
    explorerLiquidAPI: string,
    pegins: Pegins,
    currentBtcBlockHeight: number,
    network: NetworkString
  ): Promise<Pegins> {
    let claimedPegins: Pegins = {};
    const peginModule = await BitcoinService.getPeginModule(network);
    for (const claimScript in pegins) {
      const pegin = pegins[claimScript];
      for (const outpoint in pegin?.depositUtxos) {
        const depositUtxo = pegin.depositUtxos[outpoint];
        const confirmations =
          depositUtxo.status.block_height && currentBtcBlockHeight - depositUtxo.status.block_height + 1;
        // Continue if utxo not claimed and claimable
        if (!depositUtxo.claimTxId && confirmations && confirmations >= 102) {
          try {
            const ecPair = this.generateSigningPrivKey(pegin.depositAddress.derivationPath, network);
            const btcPeginTxHex = (await axios.get(`${explorerBitcoinAPI}/tx/${depositUtxo.txid}/hex`)).data;
            const btcBlockProof = (await axios.get(`${explorerBitcoinAPI}/tx/${depositUtxo.txid}/merkleblock-proof`))
              .data;
            const claimTxHex = await peginModule.claimTx(btcPeginTxHex, btcBlockProof, claimScript);
            const signedClaimTxHex = this.signClaimTx(claimTxHex, btcPeginTxHex, claimScript, ecPair);
            const claimTxId = await chainSource.broadcastTransaction(signedClaimTxHex);
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

  signClaimTx(claimTxHex: string, btcPeginTxHex: string, claimScript: string, ecPair: ECPairInterface): string {
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

  generateSigningPrivKey(derivationPath: string, network: NetworkString): ECPairInterface {
    const child: BIP32Interface = this.masterNode.derivePath(derivationPath);
    return ECPairFactory(ecc).fromWIF(child.toWIF(), getNetwork(network));
  }

  async fetchBitcoinUtxos(address: string, explorerBitcoinAPI: string): Promise<DepositPeginUtxo[]> {
    return (await axios.get(`${explorerBitcoinAPI}/address/${address}/utxo`)).data;
  }
}
