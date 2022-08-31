import './style.scss';
import {KeyboardStyle} from '@capacitor/keyboard';
import {IonCol, IonContent, IonGrid, IonPage, IonRow, useIonViewWillEnter} from '@ionic/react';
import React, {useState} from 'react';
import {useTranslation} from "react-i18next";

import logo from '../../assets/img/tdex_3d_logo.svg';
import ButtonsMainSub from '../../components/ButtonsMainSub';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import {initApp, signIn} from '../../redux/actions/appActions';
import {addErrorToast} from '../../redux/actions/toastActions';
import {useTypedDispatch, useTypedSelector} from '../../redux/hooks';
import {PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS} from '../../utils/constants';
import {IncorrectPINError} from '../../utils/errors';
import {setKeyboardTheme} from '../../utils/keyboard';
import {checkMnemonicInStorage, getIdentity} from '../../utils/storage-helper';

const Homescreen: React.FC = () => {
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [pinModalIsOpen, setPinModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('Searching mnemonic in secure storage...');
  const {appInit, network} = useTypedSelector(({app, settings}) => ({
    appInit: app.appInit,
    network: settings.network,
  }));
  const dispatch = useTypedDispatch();
  const {t} = useTranslation();

  const onConfirmPinModal = (pin: string) => {
    getIdentity(pin, network)
      .then((mnemonic) => {
        setLoadingMessage('Unlocking wallet...');
        setLoading(true);
        setIsWrongPin(false);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
          setLoading(false);
          setPinModalIsOpen(false);
          // setIsAuth will cause redirect to /wallet
          // Restore state
          dispatch(signIn(mnemonic));
        }, PIN_TIMEOUT_SUCCESS);
      })
      .catch((e) => {
        console.error(e);
        setIsWrongPin(true);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
          setLoading(false);
        }, PIN_TIMEOUT_FAILURE);
        dispatch(addErrorToast(IncorrectPINError));
      });
  };

  useIonViewWillEnter(() => {
    const init = async () => {
      setLoading(true);
      if (!appInit) dispatch(initApp());
      await setKeyboardTheme(KeyboardStyle.Dark);
      const mnemonicExists = await checkMnemonicInStorage();
      if (mnemonicExists) setPinModalIsOpen(true);
    };
    init()
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  return (
    <IonPage id="homescreen">
      <Loader message={loadingMessage} showLoading={loading}/>
      <PinModal
        onClose={() => setPinModalIsOpen(false)}
        needReset={needReset}
        setNeedReset={setNeedReset}
        open={pinModalIsOpen}
        title="Enter your secret PIN"
        description="Unlock your wallet"
        onConfirm={onConfirmPinModal}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      <IonContent>
        <IonGrid className="ion-text-center ion-justify-content-evenly">
          <IonRow className="img-container">
            <IonCol size="8" offset="2" sizeMd="6" offsetMd="3">
              <img src={logo} alt="tdex logo"/>
            </IonCol>
          </IonRow>

          <ButtonsMainSub
            mainTitle={t('homescreen.btnMainTitle')}
            mainLink="/onboarding/backup"
            subTitle={t('homescreen.btnSubTitle')}
            subLink="/restore"
            className="btn-container"
          />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Homescreen;
