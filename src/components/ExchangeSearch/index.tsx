import React, { ChangeEvent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  IonContent,
  IonList,
  IonModal,
  IonHeader,
  IonItem,
} from '@ionic/react';
import {
  setSendAsset,
  setReceiveAsset,
} from '../../redux/actions/exchange/tradeActions';
import {
  hideSearch,
  searchAsset,
} from '../../redux/actions/exchange/searchActions';
import { IconSearch, IconClose, CurrencyIcon } from '../icons';
import './style.scss';

const ExchangeSearch: React.FC = () => {
  const dispatch = useDispatch();

  const { searchVisibility, searchParty, assets, query, rates } = useSelector(
    (state: any) => ({
      searchVisibility: state.exchange.search.visibility,
      searchParty: state.exchange.search.party,
      assets: state.exchange.search.assets,
      query: state.exchange.search.query,
      rates: state.rates,
    })
  );

  const search = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch(searchAsset(event.target.value));
  }, []);

  const pick = useCallback(
    (event) => {
      const asset = event.currentTarget.dataset.asset;
      const setAssetAction =
        searchParty == 'send' ? setSendAsset : setReceiveAsset;

      dispatch(setAssetAction(asset));
      dispatch(hideSearch());
    },
    [searchParty, assets]
  );

  const close = useCallback(() => {
    dispatch(hideSearch());
  }, []);

  return (
    <div className="search">
      <IonModal
        cssClass="modal-small"
        onDidDismiss={() => dispatch(hideSearch())}
        isOpen={searchVisibility}
      >
        <IonHeader>
          <div>
            <label className="search-bar">
              <IconSearch />
              <input
                placeholder="Search currency"
                type="text"
                value={query}
                onChange={search}
              />
              <IconClose onClick={close} />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {assets.map((asset: any) => {
              return (
                <IonItem key={asset.id} data-asset={asset.id} onClick={pick}>
                  <div
                    // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
                    tabIndex={0}
                  ></div>
                  <div className="search-item-name">
                    <span className="icon-wrapper medium">
                      <CurrencyIcon currency={asset.ticker} />
                    </span>
                    <p>{asset.name}</p>
                  </div>
                  {rates.byCurrency['eur']?.[asset.ticker.toLowerCase()] && (
                    <div className="search-item-amount">
                      <p>
                        <span className="price-equivalent">
                          {
                            rates.byCurrency['eur']?.[
                              asset.ticker.toLowerCase()
                            ]
                          }
                        </span>
                        <span>EUR</span>
                      </p>
                    </div>
                  )}
                </IonItem>
              );
            })}
          </IonList>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default ExchangeSearch;
