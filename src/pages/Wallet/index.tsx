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
  fetchBalances,
  IdentityType,
  Mnemonic,
  walletFromAddresses,
} from 'tdex-sdk';
import { useSelector } from 'react-redux';

const data = [
  {
    amount: 10,
    type: 'BTC',
  },
];

const Wallet: React.FC<any> = ({ history }) => {
  const mnemonic = useSelector((state: any) => state.wallet.mnemonic);
  const [balances, setBalances] = useState();
  useEffect(() => {
    try {
      const identity = new Mnemonic({
        chain: 'regtest',
        type: IdentityType.Mnemonic,
        value: {
          mnemonic,
        },
      });
      console.log(
        'Receiving address: ',
        identity.getNextAddress().confidentialAddress
      );

      const senderWallet = walletFromAddresses(
        identity.getAddresses(),
        'regtest'
      );
      console.log(senderWallet);
      const address = identity.getNextAddress();
      const { confidentialAddress, blindingPrivateKey } = address;

      console.log(address);

      // Receiving Address and Change address are the same with Identity.PrivateKey
      const changeAddrAndBlidning = identity.getNextChangeAddress();

      const getBalances = async () => {
        try {
          await fetchBalances(
            confidentialAddress,
            blindingPrivateKey,
            'http://localhost:3001'
          ).then((res: any) => {
            setBalances(res);
            return res;
          });
          return balances;
        } catch (e) {
          console.log(e);
        }
      };

      getBalances().then((res: any) => {
        console.log(res);
      });
      // Get the balances grouped by assetHash
    } catch (e) {
      history.replace('/');
    }
  }, []);

  return (
    <IonPage>
      <div className="gradient-background"></div>
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
      <IonContent>
        <IonList>
          <IonListHeader>Asset list</IonListHeader>
          <IonItem
            onClick={() => {
              history.push('/operations');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">asdsad</div>
              <div>asdsad</div>
            </div>
          </IonItem>
          <IonItem
            onClick={() => {
              history.push('/operations');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">
                <img src="../assets/img/btc.png" />
                <div className="item-name">
                  <div className="main-row">Bitcoin</div>
                  <div className="sub-row">fsdsa</div>
                </div>
              </div>
              <div className="item-end">
                <div className="first-col">
                  <div className="main-row">3,00</div>
                  <div className="sub-row">24,00</div>
                </div>
                <div className="second-col">
                  <div className="main-row accent">BTC</div>
                  <div className="sub-row">EUR</div>
                </div>
              </div>
            </div>
            <div className="sub-info"></div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Wallet);
