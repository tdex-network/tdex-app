import { IonContent, IonList, IonModal, IonHeader, IonItem, IonInput, IonIcon } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';

import type { Asset } from '../../store/assetStore';
import type { Currency } from '../../store/settingsStore';
import { useWalletStore } from '../../store/walletStore';
import CurrencyIcon from '../CurrencyIcon';

interface ExchangeSearchProps {
  assets: Asset[];
  setAsset: (newAsset: Asset) => void;
  isOpen: boolean;
  close: (ev: any) => void;
  currency: Currency;
}

const ExchangeSearch: React.FC<ExchangeSearchProps> = ({ assets, setAsset, isOpen, close, currency }) => {
  const balances = useWalletStore((state) => state.balances);
  const [searchString, setSearchString] = useState('');

  return (
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
              onIonChange={(e) => setSearchString(e.detail.value?.toLowerCase() || '')}
            />
            <IonIcon icon={closeSharp} color="light-contrast" onClick={close} />
          </label>
        </div>
      </IonHeader>
      <IonContent className="search-content">
        {assets.length > 0 ? (
          <IonList>
            {assets
              .filter((asset?: Asset) =>
                asset
                  ? asset.assetHash.toLowerCase().includes(searchString) ||
                    asset.ticker.toLowerCase().includes(searchString) ||
                    asset.coinGeckoID?.toLowerCase().includes(searchString)
                  : false
              )
              .map((asset: Asset, index: number) => {
                return (
                  <IonItem
                    className="ion-no-margin"
                    key={index}
                    data-asset={index}
                    onClick={(ev) => {
                      setAsset(asset);
                      close(ev);
                    }}
                  >
                    <div className="search-item-name">
                      <span>
                        <CurrencyIcon assetHash={asset.assetHash} />
                      </span>
                      <p>{asset.ticker}</p>
                    </div>
                    <div className="search-item-amount">
                      <span className="price">{balances?.[asset.assetHash]?.counterValue ?? '0'}</span>
                      <span className="fiat-currency">{currency.symbol}</span>
                    </div>
                  </IonItem>
                );
              })}
          </IonList>
        ) : (
          <p className="ion-padding-start">No asset available</p>
        )}
      </IonContent>
    </IonModal>
  );
};

export default ExchangeSearch;
