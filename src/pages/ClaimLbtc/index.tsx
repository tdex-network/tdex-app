import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/react';
import axios from 'axios';
import * as btclib from 'bitcoinjs-lib';
import {
  confidential,
  ECPair,
  script as bscript,
  Transaction,
} from 'liquidjs-lib';
import ElementsPegin from 'pegin';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { network } from '../../redux/config';
import { broadcastTx } from '../../redux/services/walletService';
import { ClaimError } from '../../utils/errors';

const ClaimLbtc: React.FC = () => {
  const [claimTxs, setClaimTxs] = useState<Transaction[]>([]);
  const { explorerUrl, explorerBitcoinUrl, peginAddresses } = useSelector(
    (state: any) => ({
      explorerUrl: state.settings.explorerUrl,
      explorerBitcoinUrl: state.settings.explorerBitcoinUrl,
      peginAddresses: state.wallet.peginAddresses,
    }),
  );
  const dispatch = useDispatch();

  const handleClaim = async (
    explorerBitcoinUrl: string,
    peginAddresses: Record<string, string>,
  ) => {
    if (!Object.values(peginAddresses).length) {
      dispatch(
        addSuccessToast(`No pegin addresses have been found in this wallet`),
      );
      return;
    }
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
          ElementsPegin.withFederationScript('52'),
        );
      }
      for (const claimScript in peginAddresses) {
        // Get pegin txs for each pegin address in state
        const btcPeginTxs = (
          await axios.get(
            `${explorerBitcoinUrl}/address/${peginAddresses[claimScript]}/txs`,
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
            //
            const ecPair = ECPair.fromWIF(signingKeyWIF, network);

            // Sign
            const transaction = Transaction.fromHex(claimTxHex);
            const prevoutTx = btclib.Transaction.fromHex(btcPeginTxHex);
            const amountPegin = prevoutTx.outs[transaction.ins[0].index].value;
            const sigHash = transaction.hashForWitnessV0(
              0,
              Buffer.from(`76a9${claimScript.slice(2)}88ac`, 'hex'),
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
            await broadcastTx(claimTxHex, explorerUrl);
            setClaimTxs([...claimTxs, Transaction.fromHex(claimTxHex)]);
            dispatch(addSuccessToast(`Claim Transaction broadcasted`));
          }
        } else {
          dispatch(
            addSuccessToast(
              `No pending claim transactions have been found for address ${peginAddresses[claimScript]}`,
            ),
          );
        }
      }
    } catch (err) {
      console.error(err);
      dispatch(addErrorToast(ClaimError));
    }
  };

  return (
    <IonPage>
      <IonContent className="backup-content">
        <IonGrid className="ion-text-center ion-justify-content-center">
          <Header hasBackButton={true} title="CLAIM LIQUID BITCOIN" />
          <PageDescription
            description="In case you think that TDEX automatic pegin functionality has failed, you can claim your Liquid Bitcoin manually."
            title="Claim your Liquid Bitcoin"
          />
          <IonRow className="ion-margin-vertical-x2">
            <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
              <IonRow className="ion-justify-content-center">
                <IonButton
                  className="main-button"
                  onClick={() =>
                    handleClaim(explorerBitcoinUrl, peginAddresses)
                  }
                >
                  CLAIM
                </IonButton>
              </IonRow>
            </IonCol>
          </IonRow>
          {claimTxs.length > 0 && (
            <IonRow className="ion-text-left">
              <IonCol size="10" offset="1">
                <ul className="ion-no-padding">
                  {`You can see your claim transaction${
                    claimTxs.length > 1 ? 's' : ''
                  } at:`}
                  {claimTxs.map((tx, i) => (
                    <li key={i}>
                      <a href={`${explorerBitcoinUrl}/tx/${tx.getId()}`}>
                        {tx.getId()}
                      </a>
                    </li>
                  ))}
                </ul>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ClaimLbtc;
