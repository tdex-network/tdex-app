import './style.scss';

import {
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonText,
} from '@ionic/react';
import { chevronForwardOutline, eye, lockOpen, trashOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';

import ChangePinModals from '../../../components/ChangePinModals';
import Header from '../../../components/Header';
import PinModal from '../../../components/PinModal';
import { addErrorToast } from '../../../redux/actions/toastActions';
import { routerLinks } from '../../../routes';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../../utils/constants';
import { IncorrectPINError } from '../../../utils/errors';
import { getMnemonicFromStorage } from '../../../utils/storage-helper';

const Account: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const [routeToGo, setRouteToGo] = useState<string>();
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const { t } = useTranslation();

  // Pin modal
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const [needPinReset, setPinNeedReset] = useState<boolean>(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const handlePinConfirm = (pin: string) => {
    getMnemonicFromStorage(pin)
      .then((mnemonic) => {
        setIsWrongPin(false);
        setPinNeedReset(true);
        setTimeout(() => {
          setPinModalOpen(false);
          setIsWrongPin(null);
          if (routeToGo === '/settings/show-mnemonic') {
            history.replace({
              pathname: routeToGo,
              state: {mnemonic},
            });
          }
          if (routeToGo === '/settings/delete-mnemonic') {
            history.replace({
              pathname: routeToGo,
              state: {pin},
            });
          }
        }, PIN_TIMEOUT_SUCCESS);
      })
      .catch((e) => {
        setIsWrongPin(true);
        setTimeout(() => {
          setIsWrongPin(null);
          setPinNeedReset(true);
        }, PIN_TIMEOUT_FAILURE);
        dispatch(addErrorToast(IncorrectPINError));
        console.error(e);
      });
  };

  return (
    <IonPage>
      {/* PIN Modal */}
      <PinModal
        needReset={needPinReset}
        setNeedReset={setPinNeedReset}
        open={pinModalOpen}
        title={t('pinModalUnlockWallet.title')}
        description={t('pinModalUnlockWallet.desc')}
        onConfirm={handlePinConfirm}
        onClose={() => setPinModalOpen(false)}
        isWrongPin={isWrongPin}
        setIsWrongPin={setIsWrongPin}
      />
      {/* IDENTITY */}
      <IonContent className="account">
        <IonGrid>
          <Header title={t('settings.general.account.pageTitle')} hasBackButton={true} />
          <IonRow>
            <IonCol>
              {/* Show Mnemonic */}
              <IonList>
                <IonListHeader>{t('settings.general.account.identity.title')}</IonListHeader>
                <IonItem
                  className="list-item"
                  onClick={() => {
                    setPinModalOpen(true);
                    setRouteToGo('/settings/show-mnemonic');
                  }}
                >
                  <div className="item-main-info">
                    <IonIcon icon={eye}/>
                    <div className="item-start">
                      <div className="main-row">{t('settings.general.account.identity.showMnemonic.title')}</div>
                      <IonText className="description">
                        {t('settings.general.account.identity.showMnemonic.desc')}
                      </IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </IonItem>
                <IonItem className="list-item" onClick={() => history.push(routerLinks.walletInfo)}>
                  <div className="item-main-info">
                    <IonIcon icon={eye} />
                    <div className="item-start">
                      <div className="main-row">Show information</div>
                      <IonText className="description">Display additional wallet information.</IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </IonItem>
              </IonList>

              <IonList>
                <IonListHeader>{t('settings.general.account.security.title')}</IonListHeader>
                {/* Change PIN */}
                <IonItem
                  className="list-item"
                  onClick={() => {
                    setShowChangePinModal(true);
                  }}
                >
                  <div className="item-main-info">
                    <IonIcon icon={lockOpen}/>
                    <div className="item-start">
                      <div className="main-row">{t('settings.general.account.security.newPin.title')}</div>
                      <IonText className="description">{t('settings.general.account.security.newPin.desc')}</IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline}/>
                  </div>
                </IonItem>
                <ChangePinModals
                  open={showChangePinModal}
                  onClose={() => setShowChangePinModal(false)}
                  onDeleted={() => {
                    setShowChangePinModal(false);
                    history.push('/homescreen');
                  }}
                />

                {/* Delete Mnemonic */}
                <IonItem
                  className="list-item"
                  onClick={() => {
                    setPinModalOpen(true);
                    setRouteToGo('/settings/delete-mnemonic');
                  }}
                >
                  <div className="item-main-info">
                    <IonIcon icon={trashOutline} />
                    <div className="item-start">
                      <div className="main-row">{t('settings.general.account.security.deleteMnemonic.title')}</div>
                      <IonText className="description">
                        {t('settings.general.account.security.deleteMnemonic.desc')}
                      </IonText>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Account);
