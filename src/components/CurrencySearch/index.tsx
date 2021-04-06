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
import './style.scss';

interface ExchangeSearchProps {
  isOpen: boolean;
  close: () => void;
}

const CurrencySearch: React.FC<ExchangeSearchProps> = ({ isOpen, close }) => {
  const [searchString, setSearchString] = useState('');
  const dispatch = useDispatch();

  return (
    <div className="search">
      <IonModal cssClass="modal-small" isOpen={isOpen} onDidDismiss={close}>
        <IonHeader>
          <div>
            <label className="search-bar">
              <IonIcon icon={searchSharp} color="light" onClick={close} />
              <IonInput
                inputMode="search"
                color="light"
                placeholder="Search currency"
                value={searchString}
                onIonChange={(e) => setSearchString(e.detail.value || '')}
              />
              <IonIcon icon={closeSharp} color="light" onClick={close} />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {CURRENCIES.map((currency: CurrencyInterface, index: number) => {
              return (
                <IonItem
                  key={index}
                  data-asset={index}
                  onClick={() => {
                    dispatch(setCurrency(currency));
                    close();
                  }}
                >
                  <div
                    // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
                    tabIndex={0}
                  ></div>
                  <div className="search-item-name">
                    <p>{`${currency.name} ${currency.symbol}`}</p>
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
