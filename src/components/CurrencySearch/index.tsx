import { IonContent, IonList, IonModal, IonHeader, IonItem, IonInput, IonIcon } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';

import type { Currency } from '../../store/settingsStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useWalletStore } from '../../store/walletStore';
import { CURRENCIES } from '../../utils/constants';

interface CurrencySearchProps {
  isOpen: boolean;
  close: (ev: any) => void;
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({ isOpen, close }) => {
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const computeBalances = useWalletStore((state) => state.computeBalances);
  //
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
            {CURRENCIES.filter(
              (currency: Currency) =>
                currency.name.toLowerCase().includes(searchString.toLowerCase()) ||
                currency.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
                currency.ticker.toLowerCase().includes(searchString.toLowerCase())
            ).map((currency: Currency, index: number) => {
              return (
                <IonItem
                  className="ion-no-margin"
                  key={index}
                  data-asset={index}
                  onClick={async (ev) => {
                    try {
                      setCurrency(currency);
                      await computeBalances();
                    } catch (e) {
                      console.error('Error computing balances');
                    } finally {
                      close(ev);
                    }
                  }}
                >
                  <div className="search-item-name">
                    <p>{`${currency.ticker.toUpperCase()} - ${currency.name}`}</p>
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
