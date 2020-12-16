import {
  IonPage,
  IonModal,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonLabel,
} from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';
// import { useParams, withRouter } from 'react-router';
import { withRouter } from 'react-router';
import { IconBack, IconClose, IconQR } from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import ExchangeRow from '../../components/ExchangeRow';
import PinInput from '../../components/PinInput';
// import { useSelector } from 'react-redux';
// import { formatPriceString, getCoinsEquivalent } from '../../utils/helpers';

const Withdrawal: React.FC = ({ history }: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef: any = useRef(null);
  // const { assets, currency, coinsRates } = useSelector((state: any) => ({
  //   assets: state.wallet.assets,
  //   transactions: state.transactions.data,
  //   address: state.wallet.address,
  //   coinsRates: state.wallet.coinsRates,
  //   currency: state.settings.currency,
  // }));
  // const [assetData, setAssetData] = useState<any>();
  // const { asset_id } = useParams();

  // useEffect(() => {
  //   const fillAssetData = () => {
  //     const asset = assets.find((item: any) => item.asset_id === asset_id);
  //     const priceEquivalent = getCoinsEquivalent(
  //       asset,
  //       coinsRates,
  //       asset.amountDisplay,
  //       currency
  //     );
  //     const res = {
  //       asset_id,
  //       ticker: asset.ticker,
  //       amountDisplay: asset.amountDisplay,
  //       amountDisplayFormatted: asset.amountDisplayFormatted,
  //       name: asset.name,
  //       priceEquivalent: priceEquivalent
  //         ? formatPriceString(priceEquivalent)
  //         : priceEquivalent,
  //     };
  //     setAssetData(res);
  //   };
  //   fillAssetData();
  // }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  const onChange = (e: any) => {
    const { value } = e.target;

    setInputValue(value);
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>Withdrawal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="withdrawal">
        <ExchangeRow />
        <IonItem className="list-item">
          <div className="item-main-info">
            <div className="item-start">sdasddsadasd</div>
            <div className="item-end">
              <IconQR fill="#fff" />
            </div>
          </div>
        </IonItem>
        <div className="buttons">
          <IonButton
            onClick={() => {
              setOpenModal(true);
            }}
            className="main-button"
          >
            <IonLabel>Confirm</IonLabel>
          </IonButton>
        </div>
        <IonModal isOpen={openModal} cssClass="modal-big withdrawal">
          <div className="gradient-background"></div>
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonButton
                style={{ zIndex: 10 }}
                onClick={() => {
                  setOpenModal(false);
                }}
              >
                <IconClose />
              </IonButton>
              <IonTitle>Withdrawal</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <PageDescription title="Insert PIN">
              <p>Insert the numeric password you’ve set at sign in</p>
            </PageDescription>
            <PinInput
              inputRef={inputRef}
              inputValue={inputValue}
              onChange={onChange}
            />
            <div className="buttons">
              <IonButton
                routerLink="/withdrawaldetails"
                onClick={() => {
                  setOpenModal(false);
                }}
                className="main-button"
              >
                Confirm
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Withdrawal);
