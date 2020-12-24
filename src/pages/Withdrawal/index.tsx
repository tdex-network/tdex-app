import {
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonLabel,
  IonInput,
  IonLoading,
  useIonViewDidLeave,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useParams, withRouter } from 'react-router';
import { IconBack, IconQR } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import { formatPriceString, getCoinsEquivalent } from '../../utils/helpers';
import WithdrawRow from '../../components/WithdrawRow';
import {
  doWithdraw,
  setQRCodeAddress,
  setWithdrawalLoading,
} from '../../redux/actions/transactionsActions';
import './style.scss';
import PinModal from '../../components/PinModal';

const Withdrawal: React.FC = ({ history }: any) => {
  const { assets, currency, coinsRates, loading, qrCodeAddress } = useSelector(
    (state: any) => ({
      assets: state.wallet.assets,
      transactions: state.transactions.data,
      address: state.wallet.address,
      coinsRates: state.wallet.coinsRates,
      currency: state.settings.currency,
      loading: state.transactions.withdrawalLoading,
      qrCodeAddress: state.transactions.qrCodeAddress,
    })
  );
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [validData, setValidData] = useState(false);
  const [assetData, setAssetData] = useState<any>();
  const [recipientAddress, setRecipientAddress] = useState<any>();
  const [amount, setAmount] = useState<any>();
  const [residualBalance, setResidualBalance] = useState<any>();
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
    if (assets?.length) {
      fillAssetData();
    }
  }, [assets, asset_id]);

  useEffect(() => {
    if (qrCodeAddress) {
      setRecipientAddress(qrCodeAddress);
      dispatch(setQRCodeAddress(null));
    }
  }, [qrCodeAddress]);

  useEffect(() => {
    if (loading === false) {
      history.push(`/withdraw/${asset_id}/details`);
      dispatch(setWithdrawalLoading(null));
    }
  }, [loading]);

  useIonViewDidLeave(() => {
    clearState();
  });

  const clearState = () => {
    if (inputValue) {
      setInputValue('');
    }
    if (amount) {
      setAmount(undefined);
    }
    if (recipientAddress) {
      setRecipientAddress('');
    }
  };

  const checkValidData = (
    residualBalanceValue: any,
    amountValue: number,
    address: string | undefined | null = recipientAddress
  ) => {
    setValidData(
      Boolean(
        address && Number(amountValue) && Number(residualBalanceValue) >= 0
      )
    );
  };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonLoading
        cssClass="my-custom-class"
        isOpen={Boolean(loading)}
        message={'Please wait...'}
      />
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
              <IonButton
                className="scan-btn"
                onClick={() => history.push('/qrscanner')}
              >
                <IconQR fill="#fff" />
              </IonButton>
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
        <div className="align-center">
          <IonButton
            onClick={() => {
              history.goBack();
              clearState();
            }}
            className="cancel-button"
          >
            <IonLabel>Cancel</IonLabel>
          </IonButton>
        </div>
        {openModal && (
          <PinModal
            openModal={openModal}
            title={'Withdrawal'}
            onConfirm={() => {
              dispatch(doWithdraw(recipientAddress, amount, assetData));
              setOpenModal(false);
            }}
            withClose
            setOpenModal={setOpenModal}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Withdrawal);
