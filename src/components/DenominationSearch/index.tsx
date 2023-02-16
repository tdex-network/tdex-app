import { IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonModal } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';

import { useSettingsStore } from '../../store/settingsStore';
import { useWalletStore } from '../../store/walletStore';
import type { LbtcDenomination } from '../../utils/constants';
import { LBTC_DENOMINATIONS } from '../../utils/constants';

interface DenominationSearchProps {
  isOpen: boolean;
  close: (ev: any) => void;
}

const DenominationSearch: React.FC<DenominationSearchProps> = ({ isOpen, close }) => {
  const setLbtcDenomination = useSettingsStore((state) => state.setLbtcDenomination);
  const computeBalances = useWalletStore((state) => state.computeBalances);
  //
  const [searchString, setSearchString] = useState('');

  return (
    <div className="search">
      <IonModal
        className="modal-small"
        isOpen={isOpen}
        onDidDismiss={(ev) => {
          setSearchString('');
          close(ev);
        }}
      >
        <IonHeader className="ion-no-border">
          <div>
            <label className="search-bar">
              <IonIcon icon={searchSharp} color="light-contrast" onClick={close} />
              <IonInput
                inputMode="search"
                color="light-contrast"
                placeholder="Search denomination"
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
                    onClick={async (ev) => {
                      try {
                        setLbtcDenomination(denomination);
                        await computeBalances();
                      } catch (e) {
                        console.error('Error computing balances');
                      } finally {
                        close(ev);
                      }
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
