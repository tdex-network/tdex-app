import { IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonModal } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { updatePrices } from '../../redux/actions/ratesActions';
import { setCurrency } from '../../redux/actions/settingsActions';
import type { CurrencyInterface } from '../../redux/reducers/settingsReducer';
import { CURRENCIES } from '../../utils/constants';

interface CurrencySearchProps {
  isOpen: boolean;
  close: (ev: any) => void;
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({ isOpen, close }) => {
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
                placeholder={t('settings.general.defaultCurrency.placeholder')}
                value={searchString}
                onIonChange={(e) => setSearchString(e.detail.value || '')}
              />
              <IonIcon icon={closeSharp} color="light-contrast" onClick={close} />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {CURRENCIES.filter(
              (currency: CurrencyInterface) =>
                currency.name.toLowerCase().includes(searchString.toLowerCase()) ||
                currency.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
                currency.value.toLowerCase().includes(searchString.toLowerCase())
            ).map((currency: CurrencyInterface, index: number) => {
              return (
                <IonItem
                  className="ion-no-margin"
                  key={index}
                  data-asset={index}
                  onClick={(ev) => {
                    dispatch(setCurrency(currency));
                    dispatch(updatePrices());
                    close(ev);
                  }}
                >
                  <div className="search-item-name">
                    <p>{`${currency.value.toUpperCase()} - ${currency.name}`}</p>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default CurrencySearch;
