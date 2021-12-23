import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonPage,
  IonRow,
  useIonViewDidLeave,
} from '@ionic/react';
import Decimal from 'decimal.js';
import type { RecipientInterface, StateRestorerOpts, UtxoInterface } from 'ldk';
import { address, psetToUnsignedTx, walletFromCoins } from 'ldk';
import { Psbt } from 'liquidjs-lib';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router';
import { mnemonicRestorerFromState } from 'tdex-sdk';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import WithdrawRow from '../../components/WithdrawRow';
import { IconQR } from '../../components/icons';
import './style.scss';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos } from '../../redux/actions/walletActions';
import { network } from '../../redux/config';
import { broadcastTx } from '../../redux/services/walletService';
import type { LbtcDenomination } from '../../utils/constants';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { IncorrectPINError, WithdrawTxError } from '../../utils/errors';
import { customCoinSelector, estimateFeeAmount, fromSatoshi, isLbtc, toSatoshi } from '../../utils/helpers';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import { getConnectedIdentity } from '../../utils/storage-helper';

interface WithdrawalProps
  extends RouteComponentProps<
    any,
    any,
    {
      address: string;
      amount: string;
      asset: string;
      lbtcUnit?: LbtcDenomination;
    }
  > {
  balances: BalanceInterface[];
  utxos: UtxoInterface[];
  prices: Record<string, number>;
  explorerLiquidAPI: string;
  lastUsedIndexes: StateRestorerOpts;
  lbtcUnit: LbtcDenomination;
}

const Withdrawal: React.FC<WithdrawalProps> = ({
  balances,
  utxos,
  prices,
  explorerLiquidAPI,
  history,
  location,
  lastUsedIndexes,
  lbtcUnit,
}) => {
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const [price, setPrice] = useState<number>();
  const [amount, setAmount] = useState<string>('');
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

  // Set current asset balance
  useEffect(() => {
    const balanceSelected = balances.find((bal) => bal.asset === asset_id);
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
  }, [balance?.coinGeckoID, prices]);

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
          balance.amount.toString(),
          balance.precision,
          isLbtc(balance.asset) ? lbtcUnit : undefined
        ).lessThan(amount || '0')
      ) {
        setError('Amount is greater than your balance');
        return;
      }
      //
      const LBTCBalance = balances.find((b) => b.coinGeckoID === 'bitcoin');
      if (!LBTCBalance || LBTCBalance.amount === 0) {
        setError('You need LBTC in order to pay fees');
        return;
      }
      // No error
      setError('');
    } catch (err) {
      console.error(err);
    }
  }, [amount]);

  const getRecipient = (): RecipientInterface => ({
    address: recipientAddress?.trim(),
    asset: balance?.asset || '',
    value: toSatoshi(amount || '0', balance?.precision, balance?.ticker === 'L-BTC' ? lbtcUnit : undefined).toNumber(),
  });

  const isValid = (): boolean => {
    if (error) return false;
    if (!balance || new Decimal(amount || '0').lessThanOrEqualTo(0)) return false;
    return recipientAddress !== '';
  };

  const createTxAndBroadcast = async (pin: string) => {
    try {
      if (!isValid()) return;
      setLoading(true);
      // Check pin
      let identity;
      try {
        identity = await getConnectedIdentity(pin, dispatch);
        setIsWrongPin(false);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
        }, PIN_TIMEOUT_SUCCESS);
      } catch (_) {
        throw IncorrectPINError;
      }
      // Check if substract fee necessary
      const LbtcBalance = balances.find((b) => b.coinGeckoID === 'bitcoin')?.amount || 0;
      const fee = estimateFeeAmount(utxos, [getRecipient()], 0.1, () => null);
      const needLBTC = toSatoshi(LbtcBalance.toString(), 8, lbtcUnit).plus(fee).toNumber();
      const substractFee = needLBTC > LbtcBalance;
      // Craft single recipient Pset
      const wallet = walletFromCoins(utxos, network.chain);
      await mnemonicRestorerFromState(identity)(lastUsedIndexes);
      const changeAddress = await identity.getNextChangeAddress();
      const withdrawPset = wallet.sendTx(
        getRecipient(),
        customCoinSelector(dispatch),
        changeAddress.confidentialAddress,
        substractFee
      );
      // blind all the outputs except fee
      const recipientData = address.fromConfidential(recipientAddress);
      const recipientScript = address.toOutputScript(recipientData.unconfidentialAddress);
      const outputsToBlind: number[] = [];
      const blindKeyMap = new Map<number, string>();
      psetToUnsignedTx(withdrawPset).outs.forEach((out, index) => {
        if (out.script.length === 0) return;
        outputsToBlind.push(index);
        if (out.script.equals(recipientScript)) blindKeyMap.set(index, recipientData.blindingKey.toString('hex'));
      });
      const blindedPset = await identity.blindPset(withdrawPset, outputsToBlind, blindKeyMap);
      // Sign tx
      const signedPset = await identity.signPset(blindedPset);
      // Broadcast tx
      const txHex = Psbt.fromBase64(signedPset).finalizeAllInputs().extractTransaction().toHex();
      const txid = await broadcastTx(txHex, explorerLiquidAPI);
      dispatch(addSuccessToast(`Transaction broadcasted. ${amount} ${balance?.ticker} sent.`));
      dispatch(watchTransaction(txid));
      setModalOpen(false);
      setLoading(false);
      history.push(`/withdraw/${txid}/details`, {
        address: recipientAddress,
        amount,
        asset: asset_id,
        lbtcUnit,
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      dispatch(unlockUtxos());
      dispatch(addErrorToast(WithdrawTxError));
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
        setIsWrongPin={setIsWrongPin}
      />
      <Loader showLoading={loading} delay={0} />
      <IonContent className="withdrawal">
        <IonGrid>
          <Header title={`${balance ? balance.ticker.toUpperCase() : ''} Withdrawal`} hasBackButton={true} />
          {balance && (
            <WithdrawRow amount={amount} balance={balance} price={price} setAmount={setAmount} error={error} />
          )}

          <IonItem className="address-input">
            <IonInput
              inputmode="text"
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyCloseKeyboard}
              value={recipientAddress}
              placeholder="Paste address here or scan QR code"
              onIonChange={(e) => {
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
