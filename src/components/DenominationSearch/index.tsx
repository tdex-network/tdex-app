import { IonContent, IonList, IonModal, IonHeader, IonItem, IonInput, IonIcon } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';

import { useSettingsStore } from '../../store/settingsStore';
import type { LbtcDenomination } from '../../utils/constants';
import { LBTC_DENOMINATIONS } from '../../utils/constants';

interface DenominationSearchProps {
  isOpen: boolean;
  close: (ev: any) => void;
}

const DenominationSearch: React.FC<DenominationSearchProps> = ({ isOpen, close }) => {
  const setLbtcDenomination = useSettingsStore((state) => state.setLbtcDenomination);
  const [searchString, setSearchString] = useState('');

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
                placeholder="Search currency"
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
              (denomination: LbtcDenomination, index: number) => {
                return (
                  <IonItem
                    className="ion-no-margin"
                    key={index}
                    data-asset={index}
                    onClick={(ev) => {
                      setLbtcDenomination(denomination);
                      // updatePrices()
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
