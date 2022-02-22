import './style.scss';
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
} from '@ionic/react';
import classNames from 'classnames';
import { checkmarkSharp } from 'ionicons/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';
import { withRouter, useParams } from 'react-router';
import { fromMasterBlindingKey } from 'slip77';
import type { NetworkString } from 'tdex-sdk';
import { getNetwork, payments } from 'tdex-sdk';

import depositIcon from '../../assets/img/deposit-green.svg';
import swapIcon from '../../assets/img/swap-circle.svg';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import WatchersLoader from '../../components/WatchersLoader';
import { CurrencyIcon, TxIcon } from '../../components/icons';
import type { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import { setModalClaimPegin } from '../../redux/actions/btcActions';
import { useTypedSelector } from '../../redux/hooks';
import { depositPeginUtxosToDisplayTxSelector } from '../../redux/reducers/btcReducer';
import { transactionsByAssetSelector } from '../../redux/reducers/transactionsReducer';
import { balancesSelector } from '../../redux/reducers/walletReducer';
import type { RootState } from '../../redux/types';
import type { LbtcDenomination } from '../../utils/constants';
import { defaultPrecision, LBTC_TICKER, MAIN_ASSETS } from '../../utils/constants';
import {
  compareTxDisplayInterfaceByDate,
  fromSatoshi,
  fromSatoshiFixed,
  isLbtc,
  isLbtcTicker,
} from '../../utils/helpers';
import type { Transfer, TxDisplayInterface } from '../../utils/types';
import { TxStatusEnum, TxTypeEnum } from '../../utils/types';

interface OperationsProps extends RouteComponentProps {
  balances: BalanceInterface[];
  prices: Record<string, number>;
  currency: string;
  lbtcUnit: LbtcDenomination;
  btcTxs: TxDisplayInterface[];
  currentBtcBlockHeight: number;
  network: NetworkString;
  watchers: string[];
}

const Operations: React.FC<OperationsProps> = ({
  balances,
  prices,
  currency,
  history,
  lbtcUnit,
  btcTxs,
  currentBtcBlockHeight,
  network,
  watchers,
}) => {
  const dispatch = useDispatch();
  const { asset_id } = useParams<{ asset_id: string }>();
  const [balance, setBalance] = useState<BalanceInterface>();
  const masterBlingKey = useTypedSelector(({ wallet }) => wallet.masterBlindKey);

  const transactionsByAsset = useSelector(transactionsByAssetSelector(asset_id));
  const transactionsToDisplay = isLbtc(asset_id, network) ? transactionsByAsset.concat(btcTxs) : transactionsByAsset;

  // effect to select the balance
  useEffect(() => {
    const balanceSelected = balances.find((bal) => bal.assetHash === asset_id);
    if (balanceSelected) {
      setBalance(balanceSelected);
    } else {
      const asset = MAIN_ASSETS[network].find((a) => a.assetHash === asset_id);
      setBalance({
        assetHash: asset?.assetHash ?? '',
        amount: 0,
        coinGeckoID: asset?.coinGeckoID ?? '',
        ticker: asset?.ticker ?? '',
        precision: asset?.precision ?? defaultPrecision,
        name: asset?.name ?? '',
      });
    }
  }, [balances, asset_id, network]);

  const onclickTx = (tx: TxDisplayInterface) => {
    if (TxTypeEnum[tx.type] === 'Swap') {
      history.push(`/tradesummary/${tx.txId}`);
    } else if (TxTypeEnum[tx.type] === 'Send' || TxTypeEnum[tx.type] === 'Receive') {
      const master = fromMasterBlindingKey(masterBlingKey);
      const derived = master.derive(tx.transfers[0].script);
      const p2wpkh = payments.p2wpkh({
        output: Buffer.from(tx.transfers[0].script, 'hex'),
        blindkey: derived.publicKey,
        network: getNetwork(network),
      });
      history.push(`/transaction/${tx.txId}`, {
        address: p2wpkh.confidentialAddress,
        amount: fromSatoshiFixed(
          tx.transfers[0].amount.toString(),
          balance?.precision,
          balance?.precision,
          isLbtc(asset_id, network) ? lbtcUnit : undefined
        ),
        asset: asset_id,
        lbtcUnit,
      });
    }
  };

  const renderStatusText: any = (status: string) => {
    const capitalized = (status[0].toUpperCase() + status.slice(1)) as keyof typeof TxStatusEnum;
    switch (status) {
      case TxStatusEnum.Confirmed:
        return (
          <span className="status-text confirmed">
            <IonIcon icon={checkmarkSharp} />
            <span className="ml-05">{TxStatusEnum[capitalized]}</span>
          </span>
        );
      case TxStatusEnum.Pending:
        return <span className="status-text pending">{TxStatusEnum[capitalized]}</span>;
      default:
        return <span className="status-text pending" />;
    }
  };

  const getConfirmationCount = (txBlockHeight?: number) => {
    if (!txBlockHeight) return 0;
    // Plus the block that contains the tx
    return currentBtcBlockHeight - txBlockHeight + 1;
  };

  const checkIfPeginIsClaimable = (btcTx: TxDisplayInterface): boolean => {
    // Check if pegin not already claimed and utxo is mature
    return !btcTx.claimTxId && getConfirmationCount(btcTx.blockHeight) >= 102;
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
                      asset: balance?.assetHash,
                      ticker: balance?.ticker ?? LBTC_TICKER[network],
                      coinGeckoID: balance?.coinGeckoID ?? 'L-BTC',
                    },
                  },
                });
              }}
            >
              <div>
                <img src={depositIcon} alt="deposit" />
                Receive
              </div>
            </IonButton>
            <IonButton
              className="coin-action-button"
              data-cy="button-send"
              onClick={() => {
                history.push(`/withdraw/${asset_id}`);
              }}
            >
              <div>
                <img src={depositIcon} alt="withdraw" className="icon-withdraw" />
                Send
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
    [asset_id, balance?.assetHash, balance?.coinGeckoID, balance?.ticker, history, network]
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
              isLbtcTicker(balance.ticker) ? lbtcUnit : undefined
            )}
          <span>{isLbtcTicker(balance?.ticker || '') ? lbtcUnit : balance?.ticker}</span>
        </p>
        {balance?.coinGeckoID && prices[balance.coinGeckoID] && (
          <span className="info-amount-converted">
            {fromSatoshi(balance.amount.toString(), balance.precision).mul(prices[balance.coinGeckoID]).toFixed(2)}{' '}
            {currency.toUpperCase()}
          </span>
        )}
      </div>
    ),
    [balance, currency, lbtcUnit, prices]
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
              isLbtcTicker(balance.ticker) ? lbtcUnit : undefined
            )
          : 'unknown'}
        <span className="ticker">
          {TxTypeEnum[tx.type] === 'DepositBtc' || isLbtcTicker(balance.ticker) ? lbtcUnit : balance.ticker}
        </span>
      </div>
      <div className="operation-amount__fiat">
        {transfer?.amount && balance.precision && balance?.coinGeckoID && prices[balance.coinGeckoID] && (
          <div>
            {fromSatoshi(transfer.amount.toString(), balance.precision).mul(prices[balance.coinGeckoID]).toFixed(2)}{' '}
            {currency.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <IonPage>
      <IonContent id="operations" scrollEvents={true} onIonScrollStart={(e) => e.preventDefault()}>
        <Refresher />
        <IonGrid>
          <Header title={`${balance?.name || balance?.ticker}`} hasBackButton={true} />
          <IonRow className="ion-margin-bottom header-info ion-text-center ion-margin-vertical">
            <IonCol>
              {balance ? <CurrencyIcon currency={balance?.ticker} /> : <CurrencyIcon currency={LBTC_TICKER[network]} />}
              {AssetBalance}
            </IonCol>
          </IonRow>
          {ActionButtons}

          <IonRow>
            <IonCol>
              <IonList>
                <IonListHeader>Transactions</IonListHeader>
                <WatchersLoader watchers={watchers} />
                {balance && transactionsToDisplay.length ? (
                  transactionsToDisplay.sort(compareTxDisplayInterfaceByDate).map((tx: TxDisplayInterface, index) => {
                    const transfer = tx.transfers.find((t) => t.asset === asset_id);
                    return (
                      <IonItem
                        key={`${index}-${tx.txId}`}
                        button
                        detail={false}
                        onClick={() => onclickTx(tx)}
                        className="operation-item"
                      >
                        <IonRow>
                          <IonCol className="icon" size="1">
                            <TxIcon type={tx.type} />
                          </IonCol>
                          <IonCol className="pl-1" size="5.3">
                            <div className="asset">
                              {TxTypeEnum[tx.type] === 'DepositBtc'
                                ? 'Receive BTC'
                                : `${TxTypeEnum[tx.type]} ${balance.ticker}`}
                            </div>
                            <div className="time">{tx.blockTime?.format('DD MMM YYYY HH:mm:ss')}</div>
                          </IonCol>
                          <IonCol className="ion-text-right" size="5.7">
                            <OperationAmount balance={balance} transfer={transfer} tx={tx} />
                          </IonCol>
                        </IonRow>
                        <div className="extra-infos">
                          {TxTypeEnum[tx.type] !== 'DepositBtc' && (
                            <IonRow className="mt-1">
                              <IonCol className="pl-1" size="6" offset="1">
                                {`Fee: ${fromSatoshi(tx.fee.toString(), 8).toFixed(8)} ${LBTC_TICKER[network]}`}
                              </IonCol>
                              <IonCol className="ion-text-right" size="5">
                                <IonText>{renderStatusText(tx.status)}</IonText>
                              </IonCol>
                            </IonRow>
                          )}
                          <IonRow className="mt-1">
                            <IonCol className="pl-1" size="11" offset="1">
                              TxID: {tx.txId}
                            </IonCol>
                          </IonRow>
                          {TxTypeEnum[tx.type] === 'DepositBtc' && (
                            <>
                              <IonRow className="mt-1">
                                {getConfirmationCount(tx.blockHeight) < 102 && (
                                  <IonCol
                                    className={classNames(
                                      {
                                        'confirmations-pending': getConfirmationCount(tx.blockHeight) < 102,
                                      },
                                      'pl-1'
                                    )}
                                    offset="1"
                                  >
                                    {`Confirmations: ${getConfirmationCount(tx.blockHeight)} / 102`}
                                  </IonCol>
                                )}
                                {tx.claimTxId && (
                                  <IonCol size="11" offset="1" className="pl-1">
                                    <span className="status-text confirmed claimed">
                                      <IonIcon icon={checkmarkSharp} />
                                      <span className="ml-05">Claimed</span>
                                    </span>
                                  </IonCol>
                                )}
                              </IonRow>
                              {checkIfPeginIsClaimable(tx) && (
                                <IonRow className="ion-margin-top">
                                  <IonCol size="11" offset="0.5">
                                    <IonButton
                                      className="main-button claim-button"
                                      onClick={() => {
                                        // Trigger global PinModalClaimPegin in App.tsx
                                        dispatch(
                                          setModalClaimPegin({
                                            isOpen: true,
                                            claimScriptToClaim: tx.claimScript,
                                          })
                                        );
                                      }}
                                    >
                                      ClAIM NOW
                                    </IonButton>
                                  </IonCol>
                                </IonRow>
                              )}
                            </>
                          )}
                        </div>
                      </IonItem>
                    );
                  })
                ) : (
                  <p>You don't have any transactions yet</p>
                )}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    balances: balancesSelector(state),
    btcTxs: depositPeginUtxosToDisplayTxSelector(state),
    currentBtcBlockHeight: state.btc.currentBlockHeight,
    currency: state.settings.currency.value,
    explorerLiquidAPI: state.settings.explorerLiquidAPI,
    explorerBitcoinAPI: state.settings.explorerBitcoinAPI,
    lbtcUnit: state.settings.denominationLBTC,
    network: state.settings.network,
    pegins: state.btc.pegins,
    prices: state.rates.prices,
    watchers: state.transactions.watchers,
  };
};

export default withRouter(connect(mapStateToProps)(Operations));
