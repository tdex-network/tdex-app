import './style.scss';
import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonPage, IonRow } from '@ionic/react';
import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import { mnemonicToSeedSync } from 'bip39';
import classNames from 'classnames';
import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { SLIP77Factory } from 'slip77';
import * as ecc from 'tiny-secp256k1';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PageDescription from '../../components/PageDescription';
import PinModal from '../../components/PinModal';
import { useFocus } from '../../hooks/useFocus';
import { useMnemonic } from '../../hooks/useMnemonic';
import { useAppStore } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import { useWalletStore } from '../../store/walletStore';
import { getBaseDerivationPath, PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { encrypt } from '../../utils/crypto';
import type { AppError } from '../../utils/errors';
import { InvalidMnemonicError, PINsDoNotMatchError } from '../../utils/errors';
import { onPressEnterKeyFactory } from '../../utils/keyboard';

const bip32 = BIP32Factory(ecc);
const slip77 = SLIP77Factory(ecc);

export const RestoreWallet: React.FC<RouteComponentProps> = ({ history }) => {
  const setIsBackupDone = useAppStore((state) => state.setIsBackupDone);
  const network = useSettingsStore((state) => state.network);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const addScriptDetails = useWalletStore((state) => state.addScriptDetails);
  const setEncryptedMnemonic = useWalletStore((state) => state.setEncryptedMnemonic);
  const setIsAuthorized = useWalletStore((state) => state.setIsAuthorized);
  const setMasterBlindingKey = useWalletStore((state) => state.setMasterBlindingKey);
  const setMasterPublicKey = useWalletStore((state) => state.setMasterPublicKey);
  //
  const [mnemonic, setMnemonicWord] = useMnemonic();
  const [modalOpen, setModalOpen] = useState<'first' | 'second'>();
  const [firstPin, setFirstPin] = useState<string>();
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  const handleConfirm = () => {
    if (!bip39.validateMnemonic(mnemonic.join(' '))) {
      addErrorToast(InvalidMnemonicError);
      return;
    }
    setModalOpen('first');
  };

  // use for keyboard tricks
  const [refs, setFocus] = useFocus(12, handleConfirm);

  const onFirstPinConfirm = (newPin: string) => {
    setFirstPin(newPin);
    setIsWrongPin(false);
    setTimeout(() => {
      setModalOpen('second');
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_SUCCESS);
  };

  const onSecondPinConfirm = async (newPin: string) => {
    if (newPin === firstPin) {
      setLoading(true);
      const mnemonicStr = mnemonic.join(' ');
      const encryptedMnemonic = await encrypt(mnemonicStr, newPin);
      setEncryptedMnemonic(encryptedMnemonic);
      setIsBackupDone(true);
      addSuccessToast('Mnemonic generated and encrypted with your PIN.');
      setIsWrongPin(false);
      setTimeout(() => {
        setModalOpen(undefined);
        setIsWrongPin(null);
        setLoading(false);
        setIsAuthorized(true); // will cause redirect to /wallet
        const seed = mnemonicToSeedSync(mnemonicStr);
        const masterPublicKey = bip32.fromSeed(seed).derivePath(getBaseDerivationPath(network)).neutered().toBase58();
        setMasterPublicKey(masterPublicKey);
        const masterBlindingKey = slip77.fromSeed(seed).masterKey.toString('hex');
        setMasterBlindingKey(masterBlindingKey);
        // Restore state
        // restoreFromMnemonic / restorerFromEsplora
        //addScriptDetails({confidentialAddress: ''})
        // identity.getAddresses()
        // yield put(addScriptDetails(addr));
        /*yield all([
          put(watchCurrentBtcBlockHeight()),
          put(updateDepositPeginUtxos()),
          put(checkIfClaimablePeginUtxo()),
          put(updateTransactions()),
          put(updatePrices()),
          put(updateUtxos()),
        ])*/
      }, PIN_TIMEOUT_SUCCESS);
    } else {
      onError(PINsDoNotMatchError);
    }
  };

  const onError = (e: AppError) => {
    console.error(e);
    //clearStorage().catch(console.error);
    // TODO: remove specific wrong state
    addErrorToast(e);
    setIsWrongPin(true);
    setLoading(false);
    setFirstPin('');
    setTimeout(() => {
      setModalOpen('first');
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
  };

  return (
    <IonPage>
      <Loader showLoading={loading} />
      <PinModal
        open={modalOpen === 'first' || modalOpen === 'second'}
        title={modalOpen === 'first' ? 'Set your secret PIN' : 'Repeat your secret PIN'}
        description={
          modalOpen === 'first'
            ? "Enter a 6-digit secret PIN to secure your wallet's seed."
            : 'Confirm your secret PIN.'
        }
        onConfirm={modalOpen === 'first' ? onFirstPinConfirm : onSecondPinConfirm}
        onClose={
          modalOpen === 'first'
            ? () => {
                setModalOpen(undefined);
                history.goBack();
              }
            : () => {
                setModalOpen('first');
                setNeedReset(true);
                setFirstPin('');
                setIsWrongPin(null);
              }
        }
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
      <IonContent className="restore-wallet">
        <IonGrid className="ion-text-center">
          <Header hasBackButton={true} title="SECRET PHRASE" />
          <PageDescription
            centerDescription={true}
            description="Paste your 12 words recovery phrase in the correct order"
            title="Restore Wallet"
          />
          <div className="restore-input-wrapper ion-margin-vertical">
            {mnemonic.map((item: string, index: number) => {
              return (
                <label
                  key={index}
                  className={classNames('restore-input', {
                    active: mnemonic[index],
                  })}
                >
                  <div className="input-number">{index + 1}</div>
                  <IonInput
                    ref={refs[index]}
                    className="input-word"
                    onKeyDown={onPressEnterKeyFactory(() => setFocus(index + 1))}
                    onIonChange={(e) => setMnemonicWord(e.detail.value || '', index)}
                    value={item}
                    type="text"
                    enterkeyhint={index === refs.length - 1 ? 'done' : 'next'}
                  />
                </label>
              );
            })}
          </div>

          <IonRow className="restore-btn-container">
            <IonCol size="9" offset="1.5" sizeMd="6" offsetMd="3">
              <IonButton disabled={mnemonic.includes('')} onClick={handleConfirm} className="main-button">
                RESTORE WALLET
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
