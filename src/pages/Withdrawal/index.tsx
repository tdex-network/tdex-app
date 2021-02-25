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
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { RouteComponentProps, useParams, withRouter } from 'react-router';
import { IconBack, IconQR } from '../../components/icons';
import { useDispatch, useSelector } from 'react-redux';
import WithdrawRow from '../../components/WithdrawRow';
import './style.scss';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  address,
  greedyCoinSelector,
  psetToUnsignedTx,
  RecipientInterface,
  walletFromCoins,
} from 'ldk';
import { broadcastTx } from '../../redux/services/walletService';
import { allUtxosSelector } from '../../redux/reducers/walletReducer';
import { network } from '../../redux/config';
import { toSatoshi } from '../../utils/helpers';
import { setAddresses } from '../../redux/actions/walletActions';
import { Psbt } from 'liquidjs-lib';
import { getIdentity } from '../../utils/storage-helper';

interface WithdrawalProps extends RouteComponentProps {
  balances: BalanceInterface[];
}

const Withdrawal: React.FC<WithdrawalProps> = ({ balances, history }) => {
  // route parameter asset_id
  const { asset_id } = useParams<{ asset_id: string }>();
  const prices = useSelector((state: any) => state.rates.prices);
  const utxos = useSelector(allUtxosSelector);
  const explorerURL = useSelector((state: any) => state.settings.explorerUrl);

  const [balance, setBalance] = useState<BalanceInterface>();
  const [price, setPrice] = useState<number>();
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const dispatch = useDispatch();

  const onAmountChange = (newAmount: number | undefined) => {
    setAmount(newAmount || 0);
  };

  const isValid = (): boolean => {
    if (!balance || amount <= 0) return false;
    if (amount > balance.amount) return false;
    if (recipientAddress === '') return false;
    return true;
  };

  const onClickConfirm = async () => {
    try {
      if (!isValid()) return;
      setLoading(true);
      const identity = await getIdentity('1235');

      const wallet = walletFromCoins(utxos, network.chain);
      const psetBase64 = wallet.createTx();
      const recipient: RecipientInterface = {
        address: recipientAddress,
        asset: balance!.asset,
        value: toSatoshi(amount),
      };

      if (!identity) {
        // TODO return an error toast
        setLoading(false);
        return;
      }
      await identity.isRestored;

      const withdrawPset = wallet.buildTx(
        psetBase64,
        [recipient],
        greedyCoinSelector(),
        (_: string) => identity.getNextChangeAddress().confidentialAddress,
        true
      );

      const recipientData = address.fromConfidential(recipientAddress);
      const recipientScript = address.toOutputScript(
        recipientData.unconfidentialAddress
      );
      const outputsToBlind: number[] = [];
      const blindKeyMap = new Map<number, string>();
      // blind all the outputs except fee
      psetToUnsignedTx(withdrawPset).outs.forEach((out, index) => {
        if (out.script.length === 0) return;
        outputsToBlind.push(index);
        if (out.script.equals(recipientScript))
          blindKeyMap.set(index, recipientData.blindingKey.toString('hex'));
      });

      const blindedPset = await identity.blindPset(
        withdrawPset,
        outputsToBlind,
        blindKeyMap
      );

      const signedPset = await identity.signPset(blindedPset);
      const txHex = Psbt.fromBase64(signedPset)
        .finalizeAllInputs()
        .extractTransaction()
        .toHex();

      const txID = await broadcastTx(txHex, explorerURL);
      console.log(txID);
      dispatch(setAddresses(identity.getAddresses()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // effect to select the balance of withdrawal
  useEffect(() => {
    const balanceSelected = balances.find((bal) => bal.asset === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    }
  }, [balances]);

  // effect for fiat equivalent
  useEffect(() => {
    if (balance && balance.coinGeckoID) {
      const p = prices[balance.coinGeckoID];
      if (!p) {
        setPrice(undefined);
        return;
      }
      setPrice(p);
      return;
    }

    setPrice(undefined);
  }, [prices]);

  useEffect(() => {
    // TODO manage withdraw details
    // if (loading === false) {
    //   history.push(`/withdraw/${asset_id}/details`);
    // }
  }, [loading]);

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
          <IonTitle>
            {balance ? balance.ticker.toUpperCase() : ''} Withdrawal
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="withdrawal">
        {balance && (
          <WithdrawRow
            balance={balance}
            price={price}
            onAmountChange={onAmountChange}
          />
        )}
        <IonItem className="list-item">
          <div className="item-main-info">
            <div className="item-start">
              <IonInput
                value={recipientAddress}
                placeholder="Paste address here or scan QR code"
                onIonChange={(e) => {
                  setRecipientAddress(e.detail.value || '');
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
          <div className="align-center">
            <IonButton
              className="main-button"
              onClick={() => onClickConfirm()}
              disabled={!isValid()}
            >
              <IonLabel>CONFIRM</IonLabel>
            </IonButton>
          </div>
          <div className="align-center">
            <IonButton
              onClick={() => {
                history.goBack();
              }}
              className="cancel-button"
            >
              <IonLabel>CANCEL</IonLabel>
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Withdrawal);
