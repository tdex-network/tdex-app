import {
  IonContent,
  IonList,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonButtons,
  IonButton,
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
import { mainAssets } from '../../utils/constants';
import { formatPriceString, getCoinsEquivalent } from '../../utils/helpers';

interface AssetsDisplayInterface {
  [key: string]: Array<any>;
}

interface WalletTotalInterface {
  [currencyKey: string]: {
    amount: string;
    priceFormat: string;
  };
}

interface DiagramInterface {
  amount: number;
  type: string;
}

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
  const [total, setTotal] = useState<WalletTotalInterface>({
    lbtc: { amount: '0,00', priceFormat: '0.00' },
    eur: { amount: '0,00', priceFormat: '0.00' },
  });
  const [displayAssets, setDisplayAssets] = useState<AssetsDisplayInterface>({
    mainAssets: [],
    otherAssets: [],
  });
  const [diagramData, setDiagramData] = useState<Array<DiagramInterface>>([]);

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
      console.log('mnemonic');
      console.log(mnemonic);
      try {
        const identity = new Mnemonic({
          chain: 'regtest',
          type: IdentityType.Mnemonic,
          value: {
            mnemonic,
          },
        });
        console.log('address 123');
        console.log(identity.getNextAddress().confidentialAddress);
        if (!address) {
          const receivingAddress = identity.getNextAddress();
          console.log('receivingAddress =>');
          console.log(receivingAddress);
          Storage.set({
            key: 'address',
            value: JSON.stringify(receivingAddress),
          }).then(() => {
            dispatch(setAddress(receivingAddress));
            getBalances(receivingAddress);
          });
        } else {
          console.log('address =>');
          console.log(address);
          getBalances(address);
        }
      } catch (e) {
        console.log('error from wallet');
        console.log(e);
        history.replace('/');
      }
    }
  }, [coinsList]);

  useEffect(() => {
    if (assets && assets.length) {
      let totalAmount = 0;
      const diagramArray:
        | ((
            prevState: DiagramInterface[] | undefined
          ) => DiagramInterface[] | undefined)
        | { type: any; amount: number }[]
        | undefined = [];
      const assetsObject: {
        mainAssets: Array<any>;
        otherAssets: Array<any>;
      } = {
        mainAssets: [],
        otherAssets: [],
      };
      mainAssets.forEach((item: string) => {
        const asset = assets.find(
          (assetItem: any) => assetItem.ticker.toLowerCase() === item
        );
        if (asset) {
          const priceEquivalent = getCoinsEquivalent(
            asset,
            coinsRates,
            asset.amountDisplay,
            currency
          );
          totalAmount += Number(priceEquivalent);
          assetsObject.mainAssets.push({
            ...asset,
            priceEquivalent: priceEquivalent
              ? formatPriceString(priceEquivalent)
              : priceEquivalent,
          });
          if (priceEquivalent) {
            diagramArray.push({
              type: asset.ticker.toUpperCase(),
              amount: Number(priceEquivalent),
            });
          }
        }
      });
      assets.forEach((asset: any) => {
        if (!mainAssets.includes(asset.ticker.toLowerCase())) {
          const priceEquivalent = getCoinsEquivalent(
            asset,
            coinsRates,
            asset.amountDisplay,
            currency
          );
          totalAmount += Number(priceEquivalent);
          assetsObject.otherAssets.push({
            ...asset,
            priceEquivalent: priceEquivalent
              ? formatPriceString(priceEquivalent)
              : priceEquivalent,
          });
          if (priceEquivalent) {
            diagramArray.push({
              type: asset.ticker.toUpperCase(),
              amount: Number(priceEquivalent),
            });
          }
        }
      });
      setDisplayAssets(assetsObject);
      setTotal({
        lbtc: {
          amount: (totalAmount / coinsRates.lbtc.rate[currency]).toFixed(2),
          priceFormat: formatPriceString(
            (totalAmount / coinsRates.lbtc.rate[currency]).toFixed(2)
          ),
        },
        [currency]: {
          amount: totalAmount.toFixed(2),
          priceFormat: formatPriceString(totalAmount.toFixed(2)),
        },
      });
      if (diagramArray.length) {
        setDiagramData(diagramArray);
      }
    }
  }, [assets]);

  const getBalances = async ({
    confidentialAddress,
    blindingPrivateKey,
  }: AddressInterface) => {
    console.log('explorerUrl');
    console.log(explorerUrl);
    try {
      return await fetchBalances(
        confidentialAddress,
        blindingPrivateKey,
        explorerUrl
      ).then((res: any) => {
        console.log('res');
        console.log(res);
        dispatch(getAssets(res));
        return res;
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <div className="diagram">
        <CircleDiagram
          data={diagramData}
          total={Number(total ? total[currency].amount : '')}
        />
      </div>
      <IonContent className="wallet-content">
        <IonHeader className="header wallet">
          <IonToolbar>
            <IonTitle>Wallet</IonTitle>
          </IonToolbar>
          <div className="total-info">
            <div className="header-info wallet">
              <p className="info-heading">Total balance</p>
              <p className="info-amount">
                {total?.lbtc.priceFormat}
                <span>LBTC</span>
              </p>
              <p className="info-amount-converted">
                {total ? total[currency].priceFormat : ''}{' '}
                {currency.toUpperCase()}
              </p>
            </div>
          </div>
        </IonHeader>
        <IonButtons className="operations-buttons">
          <IonButton className="coin-action-button" routerLink="/recieve">
            Deposit
          </IonButton>
        </IonButtons>
        <IonList>
          {displayAssets.mainAssets.length ? (
            <IonListHeader>Asset list</IonListHeader>
          ) : (
            ''
          )}
          {displayAssets.mainAssets?.map((asset: any) => {
            return (
              <IonItem
                key={asset.asset_id}
                onClick={() => {
                  history.push(`/operations/${asset.asset_id}`);
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
                      <div className="main-row">
                        {asset.amountDisplayFormatted}
                      </div>
                      {asset.priceEquivalent && (
                        <div className="sub-row">{asset.priceEquivalent}</div>
                      )}
                    </div>
                    <div className="second-col">
                      <div className="main-row accent">{asset.ticker}</div>
                      {asset.priceEquivalent && (
                        <div className="sub-row">{currency.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </IonItem>
            );
          })}
          {displayAssets.otherAssets.length ? (
            <IonListHeader>Other list</IonListHeader>
          ) : (
            ''
          )}
          {displayAssets.otherAssets?.map((asset: any) => {
            return (
              <IonItem
                key={asset.asset_id}
                onClick={() => {
                  history.push(`/operations/${asset.asset_id}`);
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
                      <div className="main-row">
                        {asset.amountDisplayFormatted}
                      </div>
                      {asset.priceEquivalent && (
                        <div className="sub-row">{asset.priceEquivalent}</div>
                      )}
                    </div>
                    <div className="second-col">
                      <div className="main-row accent">{asset.ticker}</div>
                      {asset.priceEquivalent && (
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
