import {
  IonPage,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonListHeader,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewWillEnter,
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkSharp } from 'ionicons/icons';
import type { Mnemonic } from 'ldk';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter, useParams } from 'react-router';

import depositIcon from '../../assets/img/deposit-green.svg';
import swapIcon from '../../assets/img/swap-circle.svg';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import Refresher from '../../components/Refresher';
import { CurrencyIcon, TxIcon } from '../../components/icons';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { upsertPegins } from '../../redux/actions/btcActions';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import { watchTransaction } from '../../redux/actions/transactionsActions';
import WatchersLoader from '../../redux/containers/watchersLoaderContainer';
import type { Pegin, Pegins } from '../../redux/reducers/btcReducer';
import { transactionsByAssetSelector } from '../../redux/reducers/transactionsReducer';
import { claimPegins } from '../../redux/services/btcService';
import type { LbtcDenomination } from '../../utils/constants';
import {
  defaultPrecision,
  LBTC_TICKER,
  MAIN_ASSETS,
  PIN_TIMEOUT_FAILURE,
  PIN_TIMEOUT_SUCCESS,
} from '../../utils/constants';
import {
  ClaimPeginError,
  IncorrectPINError,
  NoClaimFoundError,
  PinDigitsError,
} from '../../utils/errors';
import {
  compareTxDisplayInterfaceByDate,
  fromSatoshi,
  fromSatoshiFixed,
  sleep,
} from '../../utils/helpers';
import { getIdentity } from '../../utils/storage-helper';
import type { Transfer, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';
import './style.scss';

const statusText = {
  confirmed: 'confirmed',
  pending: 'pending',
};

interface OperationsProps extends RouteComponentProps {
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  lbtcUnit: LbtcDenomination;
  btcTxs: TxDisplayInterface[];
  currentBtcBlockHeight: number;
  pegins: Pegins;
  explorerUrl: string;
  explorerBitcoinUrl: string;
}

const Operations: React.FC<OperationsProps> = ({
  balances,
  prices,
  currency,
  history,
  lbtcUnit,
  btcTxs,
  currentBtcBlockHeight,
  pegins,
  explorerUrl,
  explorerBitcoinUrl,
}) => {
  const dispatch = useDispatch();
  // Claim Button Pin Modal
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);
  //
  const [isLoading, setIsLoading] = useState(false);
  const [peginClaimScriptToClaim, setPeginClaimScriptToClaim] =
    useState<string>();
  //
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const [txRowOpened, setTxRowOpened] = useState<string[]>([]);

  const transactionsToDisplay = useSelector(
    transactionsByAssetSelector(asset_id),
  );

  useIonViewWillEnter(() => {
    setTxRowOpened([]);
  }, []);

  // effect to select the balance
  useEffect(() => {
    const balanceSelected = balances.find(bal => bal.asset === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    } else {
      const asset = MAIN_ASSETS.find(a => a.assetHash === asset_id);
      setBalance({
        asset: asset?.assetHash ?? '',
        amount: 0,
        coinGeckoID: asset?.coinGeckoID ?? '',
        ticker: asset?.ticker ?? '',
        precision: asset?.precision ?? defaultPrecision,
        name: asset?.name ?? '',
      });
    }
  }, [balances, asset_id]);

  const open = (txID: string) => setTxRowOpened([...txRowOpened, txID]);

  const close = (txID: string) =>
    setTxRowOpened(txRowOpened.filter(id => id !== txID));

  const isOpen = (tx: TxDisplayInterface): boolean => {
    if (TxTypeEnum[tx.type] === 'DepositBtc') {
      const isClaimed = !!tx.claimTxId;
      const isClaimable = checkIfPeginIsClaimable(tx);
      if (!isClaimed && !isClaimable) {
        // Not claimed, not claimable => closed by default, normal onClick behavior
        return txRowOpened.includes(tx.txId);
      } else if (!isClaimed && isClaimable) {
        // Not claimed, claimable => open and button to claim
        return true;
      } else if (isClaimed) {
        // Claimed => closed by default, normal onClick behavior
        return txRowOpened.includes(tx.txId);
      } else {
        return txRowOpened.includes(tx.txId);
      }
    } else {
      return txRowOpened.includes(tx.txId);
    }
  };

  const onclickTx = (tx: TxDisplayInterface) => {
    if (isOpen(tx)) {
      close(tx.txId);
      return;
    }
    open(tx.txId);
  };

  const managePinError = async (closeModal = false) => {
    setIsWrongPin(true);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_FAILURE);
    if (closeModal) {
      await sleep(PIN_TIMEOUT_FAILURE);
      setModalOpen(false);
    }
  };

  const managePinSuccess = async () => {
    setIsWrongPin(false);
    setTimeout(() => {
      setIsWrongPin(null);
      setNeedReset(true);
    }, PIN_TIMEOUT_SUCCESS);
    await sleep(PIN_TIMEOUT_SUCCESS);
    setModalOpen(false);
  };

  const handleClaimModalConfirm = async (pin: string) => {
    const validRegexp = new RegExp('\\d{6}');
    if (!validRegexp.test(pin)) {
      dispatch(addErrorToast(PinDigitsError));
      await managePinError();
    }
    getIdentity(pin)
      .then(async (mnemonic: Mnemonic) => {
        setIsLoading(true);
        if (peginClaimScriptToClaim) {
          claimPegins(
            explorerBitcoinUrl,
            explorerUrl,
            { [peginClaimScriptToClaim]: pegins[peginClaimScriptToClaim] },
            mnemonic,
          )
            .then(successPegins => {
              if (Object.keys(successPegins).length) {
                Object.values(successPegins).forEach((p: Pegin) => {
                  const utxos = Object.values(p.depositUtxos ?? []);
                  utxos.forEach(utxo => {
                    if (utxo.claimTxId) {
                      dispatch(watchTransaction(utxo.claimTxId));
                    }
                  });
                });
                dispatch(upsertPegins(successPegins));
                dispatch(addSuccessToast(`Claim transaction successful`));
                managePinSuccess();
                setPeginClaimScriptToClaim(undefined);
              } else {
                dispatch(addErrorToast(NoClaimFoundError));
                managePinError(true);
              }
            })
            .catch(err => {
              console.error(err);
              dispatch(addErrorToast(ClaimPeginError));
              managePinError(true);
            });
        } else {
          dispatch(addErrorToast(NoClaimFoundError));
          await managePinError(true);
        }
      })
      .catch(e => {
        console.error(e);
        dispatch(addErrorToast(IncorrectPINError));
        managePinError();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderStatusText: any = (status: string) => {
    switch (status) {
      case TxStatusEnum.Confirmed:
        return (
          <span className="status-text confirmed">
            <IonIcon icon={checkmarkSharp} />
            <span className="ml-2">{statusText[status]}</span>
          </span>
        );
      case TxStatusEnum.Pending:
        return (
          <span className="status-text pending">{statusText[status]}</span>
        );
      default:
        return <span className="status-text pending" />;
    }
  };

  const getConfirmationCount = (txBlockHeight: number) => {
    // Plus the block that contains the tx
    return currentBtcBlockHeight - txBlockHeight + 1;
  };

  const checkIfPeginIsClaimable = (btcTx: TxDisplayInterface): boolean => {
    // Check if pegin not already claimed and utxo is mature
    return !!(
      !btcTx.claimTxId &&
      btcTx.blockHeight &&
      getConfirmationCount(btcTx.blockHeight) >= 101
    );
  };

  const ActionButtons = useMemo(
    () => (
      <IonRow className="ion-margin-top">
        <IonCol>
          <IonButtons>
            <IonButton
              className="coin-action-button"
              onClick={() => {
                history.push({
                  pathname: '/receive',
                  state: {
                    depositAsset: {
                      asset: balance?.asset,
                      ticker: balance?.ticker ?? LBTC_TICKER,
                      coinGeckoID: balance?.coinGeckoID ?? 'L-BTC',
                    },
                  },
                });
              }}
            >
              <div>
                <img src={depositIcon} alt="deposit" />
                Deposit
              </div>
            </IonButton>
            <IonButton
              className="coin-action-button"
              onClick={() => {
                history.push(`/withdraw/${asset_id}`);
              }}
            >
              <div>
                <img src={depositIcon} alt="deposit" />
                Withdraw
              </div>
            </IonButton>
            <IonButton className="coin-action-button" routerLink="/exchange">
              <div>
                <img src={swapIcon} alt="swap" />
                Swap
              </div>
            </IonButton>
          </IonButtons>
        </IonCol>
      </IonRow>
    ),
    [balance?.amount],
  );

  const AssetBalance = useMemo(
    () => (
      <div className="asset-balance">
        <p className="info-amount ion-no-margin">
          {balance &&
            fromSatoshiFixed(
              balance?.amount.toString(),
              balance.precision,
              balance.precision,
              balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
            )}
          <span>
            {balance?.ticker === 'L-BTC' ? lbtcUnit : balance?.ticker}
          </span>
        </p>
        {balance?.coinGeckoID && prices[balance.coinGeckoID] && (
          <span className="info-amount-converted">
            {fromSatoshi(balance.amount.toString(), balance.precision)
              .mul(prices[balance.coinGeckoID])
              .toFixed(2)}{' '}
            {currency.toUpperCase()}
          </span>
        )}
      </div>
    ),
    [balance?.amount, lbtcUnit, prices],
  );

  const OperationAmount = ({
    balance,
    transfer,
    tx,
  }: {
    balance: BalanceInterface;
    transfer: Transfer | undefined;
    tx: TxDisplayInterface;
  }) => (
    <div className="operation-amount">
      <div className="operation-amount__lbtc">
        {transfer
          ? fromSatoshiFixed(
              transfer.amount.toString(),
              balance.precision,
              balance.precision,
              balance.ticker === 'L-BTC' ? lbtcUnit : undefined,
            )
          : 'unknown'}
        <span className="ticker">
          {TxTypeEnum[tx.type] === 'DepositBtc'
            ? 'BTC'
            : balance.ticker === 'L-BTC'
            ? lbtcUnit
            : balance.ticker}
        </span>
      </div>
      <div className="operation-amount__fiat">
        {transfer?.amount &&
          balance.precision &&
          balance?.coinGeckoID &&
          prices[balance.coinGeckoID] && (
            <div>
              {fromSatoshi(transfer.amount.toString(), balance.precision)
                .mul(prices[balance.coinGeckoID])
                .toFixed(2)}{' '}
              {currency.toUpperCase()}
            </div>
          )}
      </div>
    </div>
  );

  return (
    <IonPage>
      <Loader showLoading={isLoading} delay={0} />
      <PinModal
        open={modalOpen}
        title="Enter your secret PIN"
        description={`Enter your secret PIN to claim funds`}
        onConfirm={handleClaimModalConfirm}
        onClose={() => {
          setModalOpen(false);
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
      <IonContent
        id="operations"
        scrollEvents={true}
        onIonScrollStart={e => e.preventDefault()}
      >
        <Refresher />
        <IonGrid>
          <Header
            title={`${balance?.name || balance?.ticker}`}
            hasBackButton={true}
          />
          <IonRow className="ion-margin-bottom header-info ion-text-center ion-margin">
            <IonCol>
              {balance ? (
                <CurrencyIcon currency={balance?.ticker} />
              ) : (
                <CurrencyIcon currency={LBTC_TICKER} />
              )}
              {AssetBalance}
            </IonCol>
          </IonRow>
          {ActionButtons}

          <IonRow>
            <IonCol>
              <IonList>
                <IonListHeader>Transactions</IonListHeader>
                <WatchersLoader />
                {balance &&
                  transactionsToDisplay
                    .concat(btcTxs)
                    .sort(compareTxDisplayInterfaceByDate)
                    .map((tx: TxDisplayInterface) => {
                      const transfer = tx.transfers.find(
                        t => t.asset === asset_id,
                      );
                      return (
                        <IonItem
                          key={tx.txId}
                          button
                          onClick={() => onclickTx(tx)}
                          className={classNames('operation-item', {
                            open: isOpen(tx),
                          })}
                        >
                          <IonRow>
                            <IonCol className="icon" size="1">
                              <TxIcon type={tx.type} />
                            </IonCol>
                            <IonCol className="pl-5" size="5.5">
                              <div className="asset">
                                {TxTypeEnum[tx.type] === 'DepositBtc'
                                  ? 'BTC Deposit'
                                  : `${balance.ticker} ${TxTypeEnum[tx.type]}`}
                              </div>
                              <div className="time">
                                {isOpen(tx)
                                  ? tx.blockTime?.format('DD MMM YYYY HH:mm:ss')
                                  : tx.blockTime?.format('DD MMM YYYY')}
                              </div>
                            </IonCol>
                            <IonCol className="ion-text-right" size="5.5">
                              <OperationAmount
                                balance={balance}
                                transfer={transfer}
                                tx={tx}
                              />
                            </IonCol>
                          </IonRow>
                          <div className="extra-infos">
                            {TxTypeEnum[tx.type] !== 'DepositBtc' && (
                              <IonRow className="mt-5">
                                <IonCol className="pl-5" size="6" offset="1">
                                  {`Fee: ${fromSatoshi(
                                    tx.fee.toString(),
                                    8,
                                  ).toFixed(8)} ${LBTC_TICKER}`}
                                </IonCol>
                                <IonCol className="ion-text-right" size="5">
                                  <IonText>
                                    {renderStatusText(tx.status)}
                                  </IonText>
                                </IonCol>
                              </IonRow>
                            )}
                            <IonRow className="mt-5">
                              <IonCol className="pl-5" size="11" offset="1">
                                TxID: {tx.txId}
                              </IonCol>
                            </IonRow>
                            {TxTypeEnum[tx.type] === 'DepositBtc' && (
                              <>
                                <IonRow>
                                  <IonCol
                                    className={classNames(
                                      {
                                        'confirmations-pending': tx.blockHeight
                                          ? getConfirmationCount(
                                              tx.blockHeight,
                                            ) < 101
                                          : true,
                                      },
                                      'pl-5 mt-5',
                                    )}
                                    size="11"
                                    offset="1"
                                  >
                                    Confirmations:{' '}
                                    {tx.blockHeight
                                      ? getConfirmationCount(tx.blockHeight)
                                      : 0}
                                  </IonCol>
                                </IonRow>
                                {checkIfPeginIsClaimable(tx) && (
                                  <IonRow className="ion-margin-top">
                                    <IonCol size="11" offset="0.5">
                                      <IonButton
                                        className="main-button"
                                        onClick={() => {
                                          setModalOpen(true);
                                          setPeginClaimScriptToClaim(
                                            tx.claimScript,
                                          );
                                        }}
                                      >
                                        Claim
                                      </IonButton>
                                    </IonCol>
                                  </IonRow>
                                )}
                              </>
                            )}
                          </div>
                        </IonItem>
                      );
                    })}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Operations);
