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
import type { RecipientInterface, StateRestorerOpts } from 'ldk';
import { address, psetToUnsignedTx, walletFromCoins } from 'ldk';
import { Psbt } from 'liquidjs-lib';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router';
import type { NetworkString, UnblindedOutput } from 'tdex-sdk';
import { mnemonicRestorerFromState } from 'tdex-sdk';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import WithdrawRow from '../../components/WithdrawRow';
import { IconQR } from '../../components/icons';
import './style.scss';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { setIsFetchingUtxos } from '../../redux/actions/appActions';
import { addErrorToast, addSuccessToast } from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import { unlockUtxos, updateUtxos } from '../../redux/actions/walletActions';
import { broadcastTx } from '../../redux/services/walletService';
import { decodeBip21 } from '../../utils/bip21';
import type { LbtcDenomination } from '../../utils/constants';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { IncorrectPINError, WithdrawTxError } from '../../utils/errors';
import { customCoinSelector, fromLbtcToUnit, fromSatoshi, isLbtc, isLbtcTicker, toSatoshi } from '../../utils/helpers';
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
      precision?: number;
      network?: NetworkString;
    }
  > {
  balances: BalanceInterface[];
  explorerLiquidAPI: string;
  lastUsedIndexes: StateRestorerOpts;
  lbtcUnit: LbtcDenomination;
  network: NetworkString;
  prices: Record<string, number>;
  utxos: UnblindedOutput[];
}

const Withdrawal: React.FC<WithdrawalProps> = ({
  balances,
  explorerLiquidAPI,
  history,
  location,
  lastUsedIndexes,
  lbtcUnit,
  network,
  prices,
  utxos,
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
    const balanceSelected = balances.find((bal) => bal.assetHash === asset_id);
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
          isLbtc(balance.assetHash, network) ? lbtcUnit : undefined
        ).lessThan(amount || '0')
      ) {
        setError('Amount is greater than your balance');
        return;
      }
      //
      const LBTCBalance = balances.find((b) => b.coinGeckoID === 'bitcoin');
      if (!LBTCBalance || LBTCBalance.amount === 0) {
        setError('You need LBTC to pay fees');
        return;
      }
      // No error
      setError('');
    } catch (err) {
      console.error(err);
    }
  }, [amount, balance, balances, lbtcUnit, network]);

  const getRecipient = (): RecipientInterface => ({
    address: recipientAddress?.trim(),
    asset: balance?.assetHash || '',
    value: toSatoshi(
      amount || '0',
      balance?.precision,
      isLbtcTicker(balance?.ticker || '') ? lbtcUnit : undefined
    ).toNumber(),
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
        identity = await getConnectedIdentity(pin, dispatch, network);
        setIsWrongPin(false);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
        }, PIN_TIMEOUT_SUCCESS);
      } catch (_) {
        throw IncorrectPINError;
      }
      // Craft single recipient Pset
      const wallet = walletFromCoins(utxos, network);
      await mnemonicRestorerFromState(identity)(lastUsedIndexes);
      const changeAddress = await identity.getNextChangeAddress();
      const withdrawPset = wallet.sendTx(
        getRecipient(),
        customCoinSelector(dispatch),
        changeAddress.confidentialAddress,
        true,
        // TODO: Temporary fix until https://github.com/vulpemventures/ldk/issues/99 is solved
        0.2
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
      // Trigger spinner right away
      dispatch(setIsFetchingUtxos(true));
      // But update after a few seconds to make sure new utxo is ready to fetch
      setTimeout(() => dispatch(updateUtxos()), 12_000);
      history.replace(`/transaction/${txid}`, {
        address: recipientAddress,
        amount: `-${amount}`,
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
          isLbtcTicker(balance?.ticker || '') ? lbtcUnit : balance?.ticker
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
          <Header title={`Send ${balance ? balance.ticker.toUpperCase() : ''}`} hasBackButton={true} />
          {balance && (
            <WithdrawRow
              amount={amount}
              balance={balance}
              price={price}
              setAmount={setAmount}
              error={error}
              network={network}
            />
          )}

          <IonItem className="address-input">
            <IonInput
              data-cy="input-addr-withdraw"
              inputmode="text"
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyCloseKeyboard}
              value={recipientAddress}
              placeholder="Paste address here or scan QR code"
              onIonChange={(ev) => {
                if (ev.detail.value) {
                  if (ev.detail.value.startsWith('liquidnetwork')) {
                    const { address, options } = decodeBip21(ev.detail.value, 'liquidnetwork');
                    setRecipientAddress(address);
                    if (options?.amount) {
                      // Treat the amount as in btc unit
                      // Convert to user favorite unit, taking into account asset precision
                      const unit = isLbtc(balance?.assetHash || '', network) ? lbtcUnit : undefined;
                      const amtConverted = fromLbtcToUnit(
                        new Decimal(options?.amount as string),
                        unit,
                        balance?.precision
                      ).toString();
                      setAmount(amtConverted);
                    }
                  } else {
                    setRecipientAddress(ev.detail.value);
                  }
                }
              }}
            />
            <IonButton
              className="scan-btn"
              onClick={() =>
                history.replace(`/qrscanner/${asset_id}`, {
                  amount,
                  address: '',
                  asset: asset_id,
                  lbtcUnit: lbtcUnit,
                  precision: balance?.precision,
                  network: network,
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
