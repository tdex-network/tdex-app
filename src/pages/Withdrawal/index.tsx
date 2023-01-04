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
import secp256k1 from '@vulpemventures/secp256k1-zkp';
import { signature } from 'bitcoinjs-lib/src/script';
import Decimal from 'decimal.js';
import type { RecipientInterface, StateRestorerOpts, AddressInterface } from 'ldk';
import { address as addressLDK } from 'ldk';
import { Transaction } from 'liquidjs-lib';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router';
import { SLIP77Factory } from 'slip77';
import type { BIP174SigningData, CoinSelectorErrorFn, NetworkString, OwnedInput, UnblindedOutput } from 'tdex-sdk';
import {
  Pset,
  Creator as PsetCreator,
  Signer as PsetSigner,
  Updater as PsetUpdater,
  Finalizer as PsetFinalizer,
  Extractor as PsetExtractor,
  Blinder as PsetBlinder,
  ZKPValidator,
  ZKPGenerator,
  createFeeOutput,
  DEFAULT_SATS_PER_BYTE,
  getNetwork,
} from 'tdex-sdk';
import * as ecc from 'tiny-secp256k1';

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
import { balancesSelector, lastUsedIndexesSelector, unlockedUtxosSelector } from '../../redux/reducers/walletReducer';
import { broadcastTx } from '../../redux/services/walletService';
import type { RootState } from '../../redux/types';
import { decodeBip21 } from '../../utils/bip21';
import { throwErrorHandler } from '../../utils/coinSelection';
import type { LbtcDenomination } from '../../utils/constants';
import { PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { IncorrectPINError, WithdrawTxError } from '../../utils/errors';
import { customCoinSelector, fromLbtcToUnit, fromSatoshi, isLbtc, isLbtcTicker, toSatoshi } from '../../utils/helpers';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';
import { getConnectedIdentity } from '../../utils/storage-helper';

const slip77 = SLIP77Factory(ecc);

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
  masterBlindKey: string;
  addresses: Record<string, AddressInterface>;
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
  masterBlindKey,
  addresses,
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

  const signTransaction = (pset: Pset, signers: any[], sighashType: number): Transaction => {
    const signer = new PsetSigner(pset);
    signers.forEach((keyPairs, i) => {
      const preimage = pset.getInputPreimage(i, sighashType);
      keyPairs.forEach((kp: any) => {
        const partialSig: BIP174SigningData = {
          partialSig: {
            pubkey: kp.publicKey,
            signature: signature.encode(kp.sign(preimage), sighashType),
          },
        };
        signer.addSignature(i, partialSig, Pset.ECDSASigValidator(ecc));
      });
    });
    if (!pset.validateAllSignatures(Pset.ECDSASigValidator(ecc))) {
      throw new Error('Failed to sign pset');
    }
    const finalizer = new PsetFinalizer(pset);
    finalizer.finalize();
    return PsetExtractor.extract(pset);
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
      // Craft single recipient Pset v2
      const changeAddress = await identity.getNextChangeAddress();
      const selector = customCoinSelector(dispatch);
      const firstSelection = selector(throwErrorHandler)(
        utxos,
        [getRecipient()],
        () => changeAddress.confidentialAddress
      );
      let nbConfOutputs = 0;
      let nbUnconfOutputs = 1; // init to 1 for the future fee output
      if (addressLDK.isConfidential(getRecipient().address)) {
        nbUnconfOutputs++;
      } else {
        nbUnconfOutputs++;
      }
      for (const change of firstSelection.changeOutputs) {
        if (addressLDK.isConfidential(change.address)) nbConfOutputs++;
        else nbUnconfOutputs++;
      }
      const fee = createFeeOutput(
        firstSelection.selectedUtxos.length,
        nbConfOutputs,
        nbUnconfOutputs,
        DEFAULT_SATS_PER_BYTE,
        getNetwork(network).assetHash
      );
      let errorHandler: CoinSelectorErrorFn = throwErrorHandler;
      errorHandler = (asset: string, need: number, has: number) => {
        if (asset === getRecipient().asset) {
          // Substract fee from amount
          getRecipient().value = has - fee.value;
          return;
        } // do not throw error if not enough fund with recipient's asset.
        throwErrorHandler(asset, need, has);
      };
      const { selectedUtxos, changeOutputs } = selector(errorHandler)(
        utxos,
        [getRecipient(), fee],
        () => changeAddress.confidentialAddress
      );
      const outs = [getRecipient(), ...changeOutputs]; // TODO: add fee output
      const pset = PsetCreator.newPset();
      const updater = new PsetUpdater(pset);
      selectedUtxos.forEach(({ txid, vout, prevout }) => {
        updater.addInputs([
          {
            txid: txid,
            txIndex: vout,
            witnessUtxo: prevout,
            sighashType: Transaction.SIGHASH_ALL,
          },
        ]);
      });
      outs.forEach(({ asset, value, address }) => {
        updater.addOutputs([
          {
            script: addressLDK.toOutputScript(address),
            asset: asset,
            amount: value,
          },
        ]);
      });
      updater.addOutputs([
        {
          script: undefined,
          asset: getNetwork(network).assetHash,
          amount: fee.value,
        },
      ]);
      const zkpLib = await secp256k1();
      const zkpValidator = new ZKPValidator(zkpLib);
      let zkpGenerator = new ZKPGenerator(zkpLib);
      const outputBlindingArgs = zkpGenerator.blindOutputs(pset, Pset.ECCKeysGenerator(ecc));
      const unblindedInputs: OwnedInput[] = [];
      unblindedInputs.push(
        ...selectedUtxos.map((utxo, index) => {
          return {
            index,
            ...utxo.unblindData,
          };
        })
      );
      const blinder = new PsetBlinder(pset, unblindedInputs, zkpValidator, zkpGenerator);
      blinder.blindLast({ outputBlindingArgs });
      const rawTx = signTransaction(
        pset,
        selectedUtxos.map((utxo) => addresses[utxo.prevout.script.toString('hex')].publicKey),
        Transaction.SIGHASH_ALL
      );
      console.log(rawTx.toHex());
      const txid = await broadcastTx(rawTx.toHex(), explorerLiquidAPI);
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
    } finally {
      setModalOpen(false);
      setLoading(false);
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
              name="input-addr-withdraw"
              data-testid="input-addr-withdraw"
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

const mapStateToProps = (state: RootState) => {
  return {
    addresses: state.wallet.addresses,
    balances: balancesSelector(state),
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    lastUsedIndexes: lastUsedIndexesSelector(state),
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
    prices: state.rates.prices,
    utxos: unlockedUtxosSelector(state),
    masterBlindKey: state.wallet.masterBlindKey,
  };
};

export default withRouter(connect(mapStateToProps)(Withdrawal));
