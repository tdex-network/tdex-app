import React, { useState } from 'react';
import {
  IonContent,
  IonList,
  IonModal,
  IonHeader,
  IonItem,
  IonInput,
  IonIcon,
} from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import { useDispatch } from 'react-redux';
import { CurrencyInterface } from '../../redux/reducers/settingsReducer';
import { CURRENCIES } from '../../utils/constants';
import { setCurrency } from '../../redux/actions/settingsActions';
import { updatePrices } from '../../redux/actions/ratesActions';

interface CurrencySearchProps {
  isOpen: boolean;
  close: () => void;
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({ isOpen, close }) => {
  const [searchString, setSearchString] = useState('');
  const dispatch = useDispatch();

  return (
    <div className="search">
      <IonModal cssClass="modal-small" isOpen={isOpen} onDidDismiss={close}>
        <IonHeader className="ion-no-border">
          <div>
            <label className="search-bar">
              <IonIcon
                icon={searchSharp}
                color="light-contrast"
                onClick={close}
              />
              <IonInput
                inputMode="search"
                color="light-contrast"
                placeholder="Search currency"
                value={searchString}
                onIonChange={(e) => setSearchString(e.detail.value || '')}
              />
              <IonIcon
                icon={closeSharp}
                color="light-contrast"
                onClick={close}
              />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {CURRENCIES.filter(
              (currency: CurrencyInterface) =>
                currency.name.includes(searchString) ||
                currency.symbol.includes(searchString) ||
                currency.value.includes(searchString)
            ).map((currency: CurrencyInterface, index: number) => {
              return (
                <IonItem
                  className="ion-no-margin"
                  key={index}
                  data-asset={index}
                  onClick={() => {
                    dispatch(setCurrency(currency));
                    dispatch(updatePrices());
                    close();
                  }}
                >
                  <div className="search-item-name">
                    <p>{`${currency.symbol} ${currency.name} (${currency.value})`}</p>
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
