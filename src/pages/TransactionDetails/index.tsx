import './style.scss';
import { IonPage, IonContent, IonSkeletonText, IonGrid, IonRow, IonCol } from '@ionic/react';
import { Transaction } from 'liquidjs-lib';
import React, { useEffect, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { withRouter, useParams } from 'react-router';

import CurrencyIcon from '../../components/CurrencyIcon';
import Header from '../../components/Header';
import Refresher from '../../components/Refresher';
import { useAssetStore } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import type { TxHeuristic } from '../../store/walletStore';
import { useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';
import type { LbtcDenomination } from '../../utils/constants';
import { isLbtc, makeURLwithBlinders } from '../../utils/helpers';

interface transactionDetailsLocationState {
  address: string;
  amount: number;
  asset: string;
  lbtcUnit: LbtcDenomination;
}

const TransactionDetails: React.FC<RouteComponentProps<any, any, transactionDetailsLocationState>> = ({ location }) => {
  const { txid } = useParams<{ txid: string }>();
  const assets = useAssetStore((state) => state.assets);
  const explorerLiquidUI = useSettingsStore((state) => state.explorerLiquidUI);
  const lbtcUnit = useSettingsStore((state) => state.lbtcDenomination);
  const network = useSettingsStore((state) => state.network);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const txs = useWalletStore((state) => state.txs);
  const computeHeuristicFromTx = useWalletStore((state) => state.computeHeuristicFromTx);
  //
  const [locationState, setLocationState] = useState<transactionDetailsLocationState>();
  const [transaction, setTransaction] = useState<TxHeuristic>();

  useEffect(() => {
    if (location.state) {
      setLocationState(location.state);
    }
  }, [location]);

  useEffect(() => {
    (async () => {
      const transaction = txs?.[txid];
      if (transaction) {
        const heuristicTx = await computeHeuristicFromTx(transaction, 'details');
        setTransaction(heuristicTx);
      }
    })();
  }, [computeHeuristicFromTx, txid, txs]);

  const renderStatusText: any = (isConfirmed: boolean) => {
    if (isConfirmed) {
      return <span className="status-text confirmed">completed</span>;
    } else {
      return <span className="status-text pending">pending</span>;
    }
  };

  const Skeleton = () => <IonSkeletonText className="custom-skeleton" animated />;

  return (
    <IonPage id="transaction-details">
      <IonContent>
        <Refresher />
        <IonGrid>
          <Header
            hasBackButton={true}
            title={`${locationState?.amount && locationState.amount > 0 ? 'RECEIVE' : 'SEND'} DETAILS`}
          />
          <IonRow>
            <IonCol className="header-info ion-text-center">
              <CurrencyIcon assetHash={locationState?.asset || ''} />
              <p className="info-amount">
                {assets[locationState?.asset || '']?.name ?? assets[locationState?.asset || '']?.ticker}
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <div className="card-details">
                <div className="item-main-info">
                  <div className="item-start main-row">Amount</div>
                  <div className="item-end main-row">
                    {`${locationState?.amount ? locationState.amount : '?'} ${
                      isLbtc(locationState?.asset || '', network)
                        ? lbtcUnit
                        : assets[locationState?.asset || '']?.ticker
                    }`}
                  </div>
                </div>
                <div className="item-main-info">
                  <div className="item-start main-row">Status</div>
                  <div className="item-end main-row completed">
                    {transaction ? renderStatusText(!!transaction?.blockHeight) : <Skeleton />}
                  </div>
                </div>

                <div className="item-main-info divider">
                  <div className="item-start main-row">Date</div>
                  <div className="item-end sub-row">
                    {transaction ? transaction.blockTime?.format('DD MMM YYYY HH:mm:ss') : <Skeleton />}
                  </div>
                </div>

                <div className="item-main-info">
                  <div className="item-start main-row">Fee</div>
                  <div className="item-end sub-row">{transaction ? transaction.fee : <Skeleton />}</div>
                </div>

                <div
                  className="item-main-info"
                  onClick={() => {
                    clipboardCopy(`${explorerLiquidUI}/address/${locationState?.address}`, () => {
                      addSuccessToast('Address copied!');
                    });
                  }}
                >
                  <div className="item-start main-row">Address</div>
                  <div className="item-end sub-row">{locationState?.address || ''}</div>
                </div>

                <div
                  className="item-main-info"
                  onClick={async () => {
                    clipboardCopy(await makeURLwithBlinders(Transaction.fromHex(txs[txid].hex)), () => {
                      addSuccessToast('TxID copied!');
                    });
                  }}
                >
                  <div className="item-start main-row">TxID</div>
                  <div className="item-end sub-row">{txid}</div>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(TransactionDetails);
