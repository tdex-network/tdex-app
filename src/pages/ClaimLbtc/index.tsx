import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/react';
import axios from 'axios';
import * as bip32 from 'bip32';
import type { BIP32Interface } from 'bip32';
import * as btclib from 'bitcoinjs-lib';
import type { Mnemonic } from 'ldk';
import {
  confidential,
  ECPair,
  script as bscript,
  Transaction,
} from 'liquidjs-lib';
import ElementsPegin from 'pegin';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNetwork } from 'tdex-sdk';

import Header from '../../components/Header';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { network } from '../../redux/config';
import type { WalletState } from '../../redux/reducers/walletReducer';
import { broadcastTx } from '../../redux/services/walletService';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import {
  ClaimError,
  IncorrectPINError,
  PinDigitsError,
} from '../../utils/errors';
import { getIdentity } from '../../utils/storage-helper';

const ClaimLbtc: React.FC = () => {
  // Pin Modal
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  //
  const [claimTxs, setClaimTxs] = useState<Transaction[]>([]);
  const { explorerUrl, explorerBitcoinUrl, peginAddresses } = useSelector(
    (state: any) => ({
      explorerUrl: state.settings.explorerUrl,
      explorerBitcoinUrl: state.settings.explorerBitcoinUrl,
      peginAddresses: state.wallet.peginAddresses,
    }),
  );
  const dispatch = useDispatch();

  const managePinError = () => {
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
  };

  const managePinSuccess = () => {
    setIsWrongPin(false);
    setTimeout(() => {
      setIsWrongPin(null);
    }, PIN_TIMEOUT_SUCCESS);
  };

  const handleClaim = async (
    explorerBitcoinUrl: string,
    peginAddresses: WalletState['peginAddresses'],
    mnemonic: Mnemonic,
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
          ElementsPegin.withFederationScript('51'),
        );
      }
      for (const claimScript in peginAddresses) {
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
            await broadcastTx(claimTxHex, explorerUrl);
            setClaimTxs([...claimTxs, Transaction.fromHex(claimTxHex)]);
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
    } catch (err) {
      console.error(err);
      managePinError();
      dispatch(addErrorToast(ClaimError));
    }
  };

  const handleConfirm = (pin: string) => {
    const validRegexp = new RegExp('\\d{6}');
    if (validRegexp.test(pin)) {
      getIdentity(pin)
        .then(async (mnemonic: Mnemonic) => {
          await handleClaim(explorerBitcoinUrl, peginAddresses, mnemonic);
        })
        .catch(e => {
          console.error(e);
          managePinError();
          dispatch(addErrorToast(IncorrectPINError));
        });
    } else {
      managePinError();
      dispatch(addErrorToast(PinDigitsError));
    }
  };

  return (
    <IonPage>
      <PinModal
        open={modalOpen}
        title="Enter your secret PIN"
        description={`Enter your secret PIN to claim funds`}
        onConfirm={handleConfirm}
        onClose={() => {
          setModalOpen(false);
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
      />
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
                  onClick={() => {
                    setModalOpen(true);
                  }}
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
