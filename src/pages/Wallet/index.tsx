import {
  IonContent,
  IonList,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import CircleDiagram from '../../components/CircleDiagram';

//styles
import './style.scss';
import {
  AddressInterface,
  fetchBalances,
  IdentityType,
  Mnemonic,
} from 'tdex-sdk';
import { useDispatch, useSelector } from 'react-redux';
import { Storage } from '@capacitor/core';
import {
  getAssets,
  getCoinsList,
  setAddress,
} from '../../redux/actions/walletActions';
import { explorerUrl } from '../../redux/services/walletService';
import { CurrencyIcon } from '../../components/icons';

const data = [
  {
    amount: 10,
    type: 'BTC',
  },
];

const Wallet: React.FC<any> = ({ history }) => {
  const {
    mnemonic,
    address,
    assets,
    coinsList,
    currency,
    coinsRates,
  } = useSelector((state: any) => ({
    mnemonic: state.wallet.mnemonic,
    address: state.wallet.address,
    assets: state.wallet.assets,
    coinsList: state.wallet.coinsList,
    currency: state.settings.currency,
    coinsRates: state.wallet.coinsRates,
  }));
  const dispatch = useDispatch();
  const [balances, setBalances] = useState();

  useEffect(() => {
    if (!coinsList) {
      try {
        dispatch(getCoinsList());
      } catch (e) {
        console.log(e);
      }
    }
  }, []);

  useEffect(() => {
    if (!assets && coinsList) {
      try {
        const identity = new Mnemonic({
          chain: 'regtest',
          type: IdentityType.Mnemonic,
          value: {
            mnemonic,
          },
        });

        if (!address) {
          const receivingAddress = identity.getNextAddress();
          Storage.set({
            key: 'address',
            value: JSON.stringify(receivingAddress),
          }).then(() => {
            dispatch(setAddress(receivingAddress));
            getBalances(receivingAddress);
          });
        } else {
          getBalances(address);
        }
      } catch (e) {
        history.replace('/');
      }
    }
  }, [coinsList]);

  const getBalances = async ({
    confidentialAddress,
    blindingPrivateKey,
  }: AddressInterface) => {
    try {
      return await fetchBalances(
        confidentialAddress,
        blindingPrivateKey,
        explorerUrl
      ).then((res: any) => {
        setBalances(res);
        dispatch(getAssets(res));
        console.log(balances);
        return res;
      });
    } catch (e) {
      console.log(e);
    }
  };

  const getCoinsEquivalent = (asset: any) => {
    return coinsRates[asset.ticker.toLowerCase()]
      ? (
          Number(asset.amountDisplay) *
          coinsRates[asset.ticker.toLowerCase()].rate[currency]
        ).toFixed(2)
      : false;
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonContent className="wallet-content">
        <IonHeader className="header wallet">
          <IonToolbar>
            <IonTitle>Wallet</IonTitle>
          </IonToolbar>
          <div className="total-info">
            <div className="header-info wallet">
              <p className="info-heading">Total balance</p>
              <p className="info-amount">
                10,00<span>BTC</span>
              </p>
              <p className="info-amount-converted">114,000,80 EUR</p>
            </div>
            <CircleDiagram className="diagram" data={data} />
          </div>
        </IonHeader>
        <IonList>
          <IonListHeader>Asset list</IonListHeader>
          {assets?.map((asset: any) => {
            const equivalent = getCoinsEquivalent(asset);
            return (
              <IonItem
                key={asset.asset_id}
                onClick={() => {
                  history.push('/operations');
                }}
              >
                <div className="item-main-info">
                  <div className="item-start">
                    <CurrencyIcon currency={asset.ticker} />
                    <div className="item-name">
                      <div className="main-row">{asset.name}</div>
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="first-col">
                      <div className="main-row">{asset.amountDisplay}</div>
                      {equivalent && (
                        <div className="sub-row">
                          {getCoinsEquivalent(asset)}
                        </div>
                      )}
                    </div>
                    <div className="second-col">
                      <div className="main-row accent">{asset.ticker}</div>
                      {equivalent && (
                        <div className="sub-row">{currency.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Wallet);
