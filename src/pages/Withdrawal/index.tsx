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
  IonInput,
} from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';
import { useParams, withRouter } from 'react-router';
import { IconBack, IconClose, IconQR } from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import PinInput from '../../components/PinInput';
import { useDispatch, useSelector } from 'react-redux';
import { formatPriceString, getCoinsEquivalent } from '../../utils/helpers';
import WithdrawRow from '../../components/WithdrawRow';
import { doWithdraw } from '../../redux/actions/transactionsActions';
import './style.scss';

const Withdrawal: React.FC = ({ history }: any) => {
  const { assets, currency, coinsRates, pin } = useSelector((state: any) => ({
    assets: state.wallet.assets,
    transactions: state.transactions.data,
    address: state.wallet.address,
    pin: state.wallet.pin,
    coinsRates: state.wallet.coinsRates,
    currency: state.settings.currency,
  }));
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [validPin, setValidPin] = useState(false);
  const [validData, setValidData] = useState(false);
  const [assetData, setAssetData] = useState<any>();
  const [recipientAddress, setRecipientAddress] = useState<any>();
  const [amount, setAmount] = useState<any>();
  const [residualBalance, setResidualBalance] = useState<any>();
  const inputRef: any = useRef(null);
  const { asset_id } = useParams();

  useEffect(() => {
    const fillAssetData = () => {
      const asset = assets.find((item: any) => item.asset_id === asset_id);
      const priceEquivalent = getCoinsEquivalent(
        asset,
        coinsRates,
        asset.amountDisplay,
        currency
      );
      const res = {
        asset_id,
        ticker: asset.ticker,
        amount: asset.amount,
        amountDisplay: asset.amountDisplay,
        amountDisplayFormatted: asset.amountDisplayFormatted,
        name: asset.name,
        precision: asset.precision,
        priceEquivalent: priceEquivalent
          ? formatPriceString(priceEquivalent)
          : priceEquivalent,
      };
      setAssetData(res);
    };
    if (assets?.length && !assetData) {
      fillAssetData();
    }
  }, [assets]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  useEffect(() => {
    console.log(amount);
  }, [amount]);

  const onChange = (e: any) => {
    const { value } = e.target;

    if (value.length < 7) {
      if (pin === value) {
        setValidPin(true);
      } else {
        setValidPin(false);
      }
      setInputValue(value);
    }
  };

  const checkValidData = (
    residualBalance: any,
    amountValue: number,
    address: string | undefined | null = recipientAddress
  ) => {
    setValidData(
      Boolean(address && Number(amountValue) && Number(residualBalance) >= 0)
    );
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
          <IonTitle>{assetData?.ticker.toUpperCase()} Withdrawal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="withdrawal">
        {assetData && (
          <WithdrawRow
            asset={assetData}
            setAmount={setAmount}
            amount={amount}
            residualBalance={residualBalance}
            setResidualBalance={setResidualBalance}
            checkValidData={checkValidData}
          />
        )}
        <IonItem className="list-item">
          <div className="item-main-info">
            <div className="item-start">
              <IonInput
                value={recipientAddress}
                placeholder="Paste address here or scan QR code"
                onIonChange={(e) => {
                  setRecipientAddress(e.detail.value);
                  checkValidData(residualBalance, amount, e.detail.value);
                }}
              />
            </div>
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
            disabled={!validData}
            className="main-button"
          >
            <IonLabel>Confirm</IonLabel>
          </IonButton>
        </div>
        <div className="buttons">
          <IonButton
            onClick={() => {
              history.goBack();
            }}
            className="cancel-button"
          >
            <IonLabel>Cancel</IonLabel>
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
                  dispatch(doWithdraw(recipientAddress, amount, assetData));
                  setOpenModal(false);
                }}
                type="button"
                disabled={!validPin}
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
