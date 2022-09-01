import { IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonModal } from '@ionic/react';
import { closeSharp, searchSharp } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CurrencyInterface } from '../../redux/reducers/settingsReducer';
import type { AssetConfig } from '../../utils/constants';
import CurrencyIcon from '../CurrencyIcon';

interface ExchangeSearchProps {
  assets: AssetConfig[];
  setAsset: (newAsset: AssetConfig) => void;
  isOpen: boolean;
  close: (ev: any) => void;
  prices: Record<string, number>;
  currency: CurrencyInterface;
}

const ExchangeSearch: React.FC<ExchangeSearchProps> = ({ prices, assets, setAsset, isOpen, close, currency }) => {
  const [searchString, setSearchString] = useState('');
  const { t } = useTranslation();

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
              .filter((asset?: AssetConfig) =>
                asset
                  ? asset.assetHash.toLowerCase().includes(searchString) ||
                    asset.ticker.toLowerCase().includes(searchString) ||
                    asset.coinGeckoID?.toLowerCase().includes(searchString)
                  : false
              )
              .map((asset: AssetConfig, index: number) => {
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
                      <span className="price">{(asset.coinGeckoID && prices[asset.coinGeckoID]) || '0'}</span>
                      <span className="fiat-currency">{currency.symbol}</span>
                    </div>
                  </IonItem>
                );
              })}
          </IonList>
        ) : (
          <p className="ion-padding-start">{t('exchangeSearch.noAsset')}</p>
        )}
      </IonContent>
    </IonModal>
  );
};

export default ExchangeSearch;
