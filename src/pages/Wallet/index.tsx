import {
  IonContent,
  IonList,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonButton,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { CurrencyIcon } from '../../components/icons';
import { BalanceInterface } from '../../redux/actionTypes/walletActionTypes';
import {
  capitalizeFirstLetter,
  fromSatoshi,
  fromSatoshiFixed,
} from '../../utils/helpers';
import { getMainAsset, LBTC_TICKER } from '../../utils/constants';
import CircleDiagram from '../../components/CircleDiagram';
import { ActionType } from '../../utils/types';
import { update } from '../../redux/actions/appActions';
import Refresher from '../../components/Refresher';
import BackupModal from '../../redux/containers/backupModalContainer';
import { useSelector } from 'react-redux';

import './style.scss';

interface WalletProps extends RouteComponentProps {
  balances: BalanceInterface[];
  currency: string;
  prices: Record<string, number>;
  dispatch: (action: ActionType) => void;
  backupDone: boolean;
}

const Wallet: React.FC<WalletProps> = ({
  balances,
  prices,
  currency,
  history,
  dispatch,
}) => {
  const [LBTCBalance, setLBTCBalance] = useState<BalanceInterface>();
  const [LBTCBalanceIndex, setLBTCBalanceIndex] = useState(-1);
  const [mainAssets, setMainAssets] = useState<BalanceInterface[]>([]);
  const [fiats, setFiats] = useState<number[]>([]);
  const backupDone = useSelector((state: any) => state.app.backupDone);
  const [backupModal, setBackupModal] = useState(false);
  const [secondaryAssets, setSecondaryAssets] = useState<BalanceInterface[]>(
    []
  );

  const UNKNOWN = -1;

  const getFiatValue = (balance: BalanceInterface) => {
    const balanceIndex = balances.findIndex((b) => b.ticker === balance.ticker);
    if (balanceIndex < 0) return UNKNOWN;
    return fiats[balanceIndex];
  };

  useEffect(() => {
    const fiatsValues = balances.map(({ amount, coinGeckoID }) => {
      if (!coinGeckoID) return UNKNOWN;
      const p = prices[coinGeckoID];
      if (!p) return UNKNOWN;
      return p * fromSatoshi(amount);
    });
    setFiats(fiatsValues);
  }, [prices, balances]);

  useEffect(() => {
    const index = balances.findIndex((b) => b.coinGeckoID === 'bitcoin');
    if (index < 0) {
      setLBTCBalance(undefined);
      setLBTCBalanceIndex(-1);
    }

    setLBTCBalanceIndex(index);
    setLBTCBalance(balances[index]);

    const main = [];
    const secondary = [];
    for (const balance of balances) {
      if (getMainAsset(balance.asset)) {
        main.push(balance);
        continue;
      }

      secondary.push(balance);
    }

    setMainAssets(main);
    setSecondaryAssets(secondary);
  }, [balances]);

  useEffect(() => {
    dispatch(update());
  }, []);

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonContent className="wallet-content">
        <Refresher />
        <div className="diagram">
          <CircleDiagram data={balances.filter((b) => b.amount > 0)} />
        </div>
        <IonHeader className="header wallet">
          <IonToolbar>
            <IonTitle>Wallet</IonTitle>
          </IonToolbar>
          <div className="total-info">
            <div className="header-info wallet">
              <p className="info-heading">Total balance</p>
              <p className="info-amount" aria-label="main-balance">
                {LBTCBalance
                  ? fromSatoshiFixed(LBTCBalance.amount, 8, 8)
                  : '0.00'}
                <span>{LBTC_TICKER}</span>
              </p>
              {LBTCBalance && fiats[LBTCBalanceIndex] > 0 && (
                <p className="info-amount-converted">
                  {`${fiats[LBTCBalanceIndex]?.toFixed(
                    2
                  )} ${currency.toUpperCase()}`}
                </p>
              )}
            </div>
          </div>
        </IonHeader>
        <IonList scroll-y={true}>
          <IonListHeader>
            Asset list
            <IonButton
              className="coin-action-button ml-auto small-button"
              onClick={() => {
                if (backupDone) {
                  history.push('/receive');
                  return;
                }
                setBackupModal(true);
              }}
            >
              Deposit
            </IonButton>
          </IonListHeader>

          {mainAssets.map((balance: BalanceInterface) => {
            const fiatValue = getFiatValue(balance);
            return (
              <IonItem
                aria-label={balance.ticker}
                key={balance.asset}
                onClick={() => {
                  history.push(`/operations/${balance.asset}`);
                }}
              >
                <div className="item-main-info">
                  <div className="item-start">
                    <CurrencyIcon currency={balance.ticker} />
                    <div className="item-name">
                      <div
                        className="main-row"
                        aria-label={`${balance.ticker}-asset`}
                      >
                        {balance.coinGeckoID
                          ? capitalizeFirstLetter(balance.coinGeckoID)
                          : 'Unknow'}
                      </div>
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="first-col">
                      <div
                        className="main-row"
                        aria-label={`${balance.ticker}-amount`}
                      >
                        {fromSatoshiFixed(
                          balance.amount,
                          balance.precision,
                          balance.precision
                        )}
                      </div>
                      <div className="sub-row">
                        {fiatValue < 0
                          ? fiatValue === UNKNOWN
                            ? 'unknown'
                            : 'loading'
                          : fiatValue?.toFixed(2)}
                      </div>
                    </div>
                    <div className="second-col">
                      <div className="main-row accent">{balance.ticker}</div>
                      {fiatValue >= 0 && (
                        <div className="sub-row">{currency.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </IonItem>
            );
          })}
          {secondaryAssets.length ? (
            <IonListHeader>Other list</IonListHeader>
          ) : (
            ''
          )}
          {secondaryAssets.map((balance: BalanceInterface) => {
            const fiatValue = getFiatValue(balance);
            return (
              <IonItem
                key={balance.asset}
                aria-label={balance.ticker}
                onClick={() => {
                  history.push(`/operations/${balance.asset}`);
                }}
              >
                <div className="item-main-info">
                  <div className="item-start">
                    <CurrencyIcon currency={balance.ticker} />
                    <div className="item-name">
                      <div
                        className="main-row"
                        aria-label={`${balance.ticker}-asset`}
                      >
                        {`Asset ${balance.ticker}`}
                      </div>
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="first-col">
                      <div
                        className="main-row"
                        aria-label={`${balance.ticker}-amount`}
                      >
                        {fromSatoshiFixed(
                          balance.amount,
                          balance.precision,
                          balance.precision
                        )}
                      </div>
                      <div className="sub-row">
                        {fiatValue > 0 && fiatValue.toFixed(2)}
                      </div>
                    </div>
                    <div className="second-col">
                      <div className="main-row accent">{balance.ticker}</div>
                      {fiatValue > 0 && (
                        <div className="sub-row">{currency.toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </IonItem>
            );
          })}
        </IonList>
        {!backupDone && (
          <BackupModal
            title="Backup your seed before deposit"
            description="Take time to keep your secret words in a safe place before deposit funds."
            removeSkipBtn={true}
            isOpen={backupModal}
            onClose={(reason: 'skipped' | 'done') => {
              if (reason === 'skipped') {
                setBackupModal(false);
              }

              if (reason === 'done') {
                setBackupModal(false);
                history.push('/receive');
              }
            }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Wallet);
