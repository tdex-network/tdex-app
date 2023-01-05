import { IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonModal } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { updatePrices } from '../../redux/actions/ratesActions';
import { setLBTCDenomination } from '../../redux/actions/settingsActions';
import { LBTC_DENOMINATIONS } from '../../utils/constants';

interface DenominationSearchProps {
  isOpen: boolean;
  close: (ev: any) => void;
}

const DenominationSearch: React.FC<DenominationSearchProps> = ({ isOpen, close }) => {
  const [searchString, setSearchString] = useState('');
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div className="search">
      <IonModal className="modal-small" isOpen={isOpen} onDidDismiss={close}>
        <IonHeader className="ion-no-border">
          <div>
            <label className="search-bar">
              <IonIcon icon={searchSharp} color="light-contrast" onClick={close} />
              <IonInput
                inputMode="search"
                color="light-contrast"
                placeholder={t('settings.general.unit.placeholder')}
                value={searchString}
                onIonChange={(e) => setSearchString(e.detail.value || '')}
              />
              <IonIcon icon={closeSharp} color="light-contrast" onClick={close} />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {LBTC_DENOMINATIONS.filter((denomination: string) => denomination.includes(searchString)).map(
              (denomination: string, index: number) => {
                return (
                  <IonItem
                    className="ion-no-margin"
                    key={index}
                    data-asset={index}
                    onClick={(ev) => {
                      dispatch(setLBTCDenomination(denomination));
                      dispatch(updatePrices());
                      close(ev);
                    }}
                  >
                    <div className="search-item-name">
                      <p>{denomination}</p>
                    </div>
                  </IonItem>
                );
              }
            )}
          </IonList>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default DenominationSearch;
