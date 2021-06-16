import {
  IonPage,
  IonContent,
  IonItem,
  IonButton,
  IonInput,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidLeave,
} from '@ionic/react';
import type { RecipientInterface, UtxoInterface } from 'ldk';
import { address, psetToUnsignedTx, walletFromCoins } from 'ldk';
import { Psbt } from 'liquidjs-lib';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router';
import { mnemonicRestorerFromState } from 'tdex-sdk';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import Header from '../../components/Header';
import PinModal from '../../components/PinModal';
import WithdrawRow from '../../components/WithdrawRow';
import { IconQR } from '../../components/icons';
import './style.scss';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos } from '../../redux/actions/walletActions';
import { network } from '../../redux/config';
import { lastUsedIndexesSelector } from '../../redux/selectors/walletSelectors';
import { broadcastTx } from '../../redux/services/walletService';
import {
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import { IncorrectPINError, WithdrawTxError } from '../../utils/errors';
import {
  customCoinSelector,
  estimateFeeAmount,
  fromSatoshi,
  toSatoshi,
} from '../../utils/helpers';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import { getConnectedIdentity } from '../../utils/storage-helper';

interface WithdrawalProps
  extends RouteComponentProps<
    any,
    any,
    { address: string; amount: number; asset: string }
  > {
  balances: BalanceInterface[];
  utxos: UtxoInterface[];
  prices: Record<string, number>;
  explorerURL: string;
}

const Withdrawal: React.FC<WithdrawalProps> = ({
  balances,
  utxos,
  prices,
  explorerURL,
  history,
  location,
}) => {
  const lbtcUnit = useSelector((state: any) => state.settings.denominationLBTC);
  const { asset_id } = useParams<{ asset_id: string }>();
  // UI state
  const [balance, setBalance] = useState<BalanceInterface>();
  const [price, setPrice] = useState<number>();
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState('');
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  const dispatch = useDispatch();

  useIonViewDidLeave(() => {
    setRecipientAddress('');
  });

  // effect to select the balance of withdrawal
  useEffect(() => {
    const balanceSelected = balances.find(bal => bal.asset === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    }
  }, [balances, asset_id]);

  // effect for fiat equivalent
  useEffect(() => {
    if (balance?.coinGeckoID) {
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
    if (location.state) {
      setRecipientAddress(location.state.address);
      setAmount(location.state.amount);
    }
  }, [location]);

  // Check amount validity
  useEffect(() => {
    try {
      if (!balance) return;
      if (
        fromSatoshi(
          balance.amount,
          balance.precision,
          balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
        ) < amount
      ) {
        setError('Amount is greater than your balance');
        return;
      }
      //
      const fee = estimateFeeAmount(utxos, [getRecipient()]);
      const LBTCBalance = balances.find(b => b.coinGeckoID === 'bitcoin');
      if (!LBTCBalance || LBTCBalance.amount === 0) {
        setError('You need LBTC in order to pay fees');
        return;
      }
      //
      let needLBTC = fee;
      if (balance.coinGeckoID === 'bitcoin') {
        needLBTC += toSatoshi(amount, 8, lbtcUnit);
      }
      if (needLBTC > LBTCBalance.amount) {
        setError('You cannot pay fees');
      }
      // No error
      setError('');
    } catch (err) {
      console.error(err);
    }
  }, [amount]);

  const lastUsedIndexes = useSelector(lastUsedIndexesSelector);

  const getRecipient = (): RecipientInterface => ({
    address: recipientAddress?.trim(),
    asset: balance?.asset || '',
    value: toSatoshi(
      amount,
      balance?.precision,
      balance?.ticker === 'L-BTC' ? lbtcUnit : undefined,
    ),
  });

  const onAmountChange = (newAmount: number | undefined) => {
    setAmount(newAmount || 0);
  };

  const isValid = (): boolean => {
    if (error) return false;
    if (!balance || amount <= 0) return false;
    return recipientAddress !== '';
  };

  const createTxAndBroadcast = async (pin: string) => {
    try {
      if (!isValid()) return;
      setLoading(true);
      let identity;
      try {
        identity = await getConnectedIdentity(pin, dispatch);
        setIsWrongPin(false);
        setTimeout(() => {
          setIsWrongPin(null);
        }, PIN_TIMEOUT_SUCCESS);
      } catch (_) {
        throw IncorrectPINError;
      }
      const wallet = walletFromCoins(utxos, network.chain);
      const psetBase64 = wallet.createTx();
      await mnemonicRestorerFromState(identity)(lastUsedIndexes);
      const changeAddress = await identity.getNextChangeAddress();
      const withdrawPset = wallet.buildTx(
        psetBase64,
        [getRecipient()],
        customCoinSelector(dispatch),
        () => changeAddress.confidentialAddress,
        true,
      );
      const recipientData = address.fromConfidential(recipientAddress);
      const recipientScript = address.toOutputScript(
        recipientData.unconfidentialAddress,
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
        blindKeyMap,
      );
      const signedPset = await identity.signPset(blindedPset);
      const txHex = Psbt.fromBase64(signedPset)
        .finalizeAllInputs()
        .extractTransaction()
        .toHex();
      const txid = await broadcastTx(txHex, explorerURL);
      dispatch(
        addSuccessToast(
          `Transaction broadcasted. ${amount} ${balance?.ticker} sent.`,
        ),
      );
      dispatch(watchTransaction(txid));
      setModalOpen(false);
      history.push(`/withdraw/${txid}/details`, {
        address: recipientAddress,
        amount,
        asset: asset_id,
      });
    } catch (err) {
      console.error(err);
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      dispatch(unlockUtxos());
      dispatch(addErrorToast(WithdrawTxError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage id="withdrawal">
      <PinModal
        open={modalOpen}
        title="Unlock your seed"
        description={`Enter your secret PIN to send ${amount} ${
          balance?.ticker === 'L-BTC' ? lbtcUnit : balance?.ticker
        }.`}
        onConfirm={createTxAndBroadcast}
        onClose={() => {
          setModalOpen(false);
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
      />
      <IonLoading
        cssClass="my-custom-class"
        isOpen={loading}
        message={'Please wait...'}
      />
      <IonContent className="withdrawal">
        <IonGrid>
          <Header
            title={`${balance ? balance.ticker.toUpperCase() : ''} Withdrawal`}
            hasBackButton={true}
          />
          {balance && (
            <WithdrawRow
              amount={amount === 0 ? undefined : amount}
              balance={balance}
              price={price}
              onAmountChange={onAmountChange}
              error={error}
            />
          )}

          <IonItem className="address-input">
            <IonInput
              inputmode="text"
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyCloseKeyboard}
              value={recipientAddress}
              placeholder="Paste address here or scan QR code"
              onIonChange={e => {
                setRecipientAddress(e.detail.value || '');
              }}
            />
            <IonButton
              className="scan-btn"
              onClick={() =>
                history.replace(`/qrscanner/${asset_id}`, {
                  amount,
                  address: '',
                  asset: asset_id,
                })
              }
            >
              <IconQR fill="#fff" />
            </IonButton>
          </IonItem>

          <IonRow className="ion-margin-vertical-x2">
            <IonCol>
              <ButtonsMainSub
                mainTitle="CONFIRM"
                subTitle="CANCEL"
                mainOnClick={() => setModalOpen(true)}
                mainDisabled={!isValid()}
                subOnClick={history.goBack}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Withdrawal);
