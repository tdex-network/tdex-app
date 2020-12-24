import React from 'react';
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
import { hideSearch } from '../../redux/actions/exchange/searchActions';
import { IconSearch, IconClose, CurrencyIcon } from '../icons';
import './style.scss';

const ExchangeSearch: React.FC = () => {
  const dispatch = useDispatch();

  const { searchVisibility, searchParty, assets } = useSelector(
    (state: any) => ({
      searchVisibility: state.exchange.search.visibility,
      searchParty: state.exchange.search.party,
      assets: state.exchange.search.assets,
    })
  );

  function selectAsset(asset: any) {
    dispatch(
      searchParty == 'send' ? setSendAsset(asset) : setReceiveAsset(asset)
    );

    dispatch(hideSearch());
  }

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
              <input placeholder="Search currency" type="text" />
              <IconClose onClick={() => dispatch(hideSearch())} />
            </label>
          </div>
        </IonHeader>
        <IonContent className="search-content">
          <IonList>
            {assets.map((asset: any) => {
              return (
                <IonItem key={asset.id} onClick={() => selectAsset(asset.id)}>
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
                  <div className="search-item-amount">
                    <p>
                      <span className="price-equivalent">10</span>
                      <span>EUR</span>
                    </p>
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

export default ExchangeSearch;
