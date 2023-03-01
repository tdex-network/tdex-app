import './style.scss';
import { IonButton, IonCol, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import classNames from 'classnames';
import { checkmarkSharp } from 'ionicons/icons';
import { Transaction } from 'liquidjs-lib';
import { useHistory } from 'react-router';

import { useAssetStore } from '../../store/assetStore';
import { useBitcoinStore } from '../../store/bitcoinStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import type { TxHeuristic } from '../../store/walletStore';
import { TxType, useWalletStore } from '../../store/walletStore';
import { clipboardCopy } from '../../utils/clipboard';
import { LBTC_TICKER } from '../../utils/constants';
import { isLbtc, isLbtcTicker, makeURLwithBlinders } from '../../utils/helpers';
import { fromSatoshiFixed } from '../../utils/unitConversion';
import CurrencyIcon from '../CurrencyIcon';
import { TxStatus } from '../TxStatus';
import { TxIcon } from '../icons';

interface SwapProps {
  // Component is slightly different if it's used in a trade only list or a transaction list (icons and title)
  listType: 'trade' | 'transaction';
  tx: TxHeuristic;
}

const getConfirmationCount = (txBlockHeight?: number) => {
  if (!txBlockHeight) return 0;
  // Plus the block that contains the tx
  return useBitcoinStore.getState().currentBtcBlockHeight - txBlockHeight + 1;
};

const checkIfPeginIsClaimable = (btcTx: TxHeuristic): boolean => {
  // Check if pegin not already claimed and utxo is mature
  return !btcTx.claimTxId && getConfirmationCount(btcTx.blockHeight) >= 102;
};

const OperationListItem: React.FC<SwapProps> = ({ tx, listType }) => {
  const network = useSettingsStore((state) => state.network);
  const assets = useAssetStore((state) => state.assets);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const lbtcUnit = useSettingsStore((state) => state.lbtcUnit);
  const txs = useWalletStore((state) => state.txs);
  const setModalClaimPegin = useBitcoinStore((state) => state.setModalClaimPegin);
  const history = useHistory();

  const isSwap = tx.type === TxType.Swap;
  const isDeposit = tx.type === TxType.Deposit;
  const isWithdraw = tx.type === TxType.Withdraw;
  const isDepositBtc = tx.type === TxType.DepositBtc;
  const isTradeList = listType === 'trade';

  return (
    <IonItem
      className={classNames('list-item transaction-item', {
        open: true,
      })}
    >
      <IonRow>
        {isTradeList ? (
          <>
            <IonCol className="icon" size="1">
              <CurrencyIcon assetHash={tx.swapSent?.asset ?? ''} />
              <CurrencyIcon assetHash={tx.swapReceived?.asset ?? ''} />
            </IonCol>
            <IonCol size="5">
              <div className="asset">{`${assets[tx.swapSent?.asset ?? '']?.ticker}/${
                assets[tx.swapReceived?.asset ?? ''].ticker
              }`}</div>
            </IonCol>
          </>
        ) : (
          <>
            <IonCol className="icon" size="1">
              <TxIcon type={tx.type} />
            </IonCol>
            <IonCol size="5">
              <div className="asset">
                {isDepositBtc && 'Receive BTC'}
                {(isDeposit || isWithdraw) && `${TxType[tx.type]} ${assets[tx.asset].ticker}`}
                {isSwap &&
                  `${TxType[tx.type]} ${assets[tx.swapSent?.asset ?? '']?.ticker}/${
                    assets[tx.swapReceived?.asset ?? ''].ticker
                  }`}
              </div>
            </IonCol>
          </>
        )}

        {isSwap ? (
          <IonCol size="6">
            <IonRow>
              <IonCol></IonCol>
              <IonCol className="justify-end trade-amount d-flex">
                {`+${fromSatoshiFixed(
                  tx.swapReceived?.amount ?? 0,
                  assets[tx.swapReceived?.asset ?? '']?.precision ?? 8,
                  assets[tx.swapReceived?.asset ?? '']?.precision ?? 8,
                  isLbtcTicker(assets[tx.swapReceived?.asset ?? '']?.ticker) ? lbtcUnit : undefined
                )}`}
                <span className="ticker">{assets[tx.swapReceived?.asset ?? '']?.ticker}</span>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol></IonCol>
              <IonCol className="justify-end trade-amount d-flex">
                {`-${fromSatoshiFixed(
                  tx.swapSent?.amount ?? 0,
                  assets[tx.swapSent?.asset ?? '']?.precision ?? 8,
                  assets[tx.swapSent?.asset ?? '']?.precision ?? 8,
                  isLbtcTicker(assets[tx.swapSent?.asset ?? '']?.ticker) ? lbtcUnit : undefined
                )}`}
                <span className="ticker">
                  {isLbtc(tx.swapSent?.asset ?? '', network) ? lbtcUnit : assets[tx.swapSent?.asset ?? '']?.ticker}
                </span>
              </IonCol>
            </IonRow>
          </IonCol>
        ) : (
          <IonCol size="6">
            <IonRow>
              <IonCol></IonCol>
              <IonCol className="justify-end trade-amount d-flex">
                {`${fromSatoshiFixed(
                  tx.amount ?? 0,
                  assets[tx.asset ?? '']?.precision ?? 8,
                  assets[tx.asset ?? '']?.precision ?? 8,
                  isLbtcTicker(assets[tx.asset ?? '']?.ticker) ? lbtcUnit : undefined
                )}`}
                <span className="ticker">
                  {isLbtc(tx.asset ?? '', network) ? lbtcUnit : assets[tx.asset ?? '']?.ticker}
                </span>
              </IonCol>
            </IonRow>
          </IonCol>
        )}
      </IonRow>

      <div className="extra-infos">
        <IonRow className="mt-1">
          <IonCol offset="1">
            <div className="time">{tx.blockTime?.format('DD MMM YYYY HH:mm:ss')}</div>
          </IonCol>
        </IonRow>
        {isDepositBtc ? (
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
                      setModalClaimPegin({
                        isOpen: true,
                        claimScriptToClaim: tx.claimScript,
                      });
                    }}
                  >
                    ClAIM NOW
                  </IonButton>
                </IonCol>
              </IonRow>
            )}
          </>
        ) : (
          <IonRow className="mt-1">
            <IonCol offset="1">{`Fee: ${fromSatoshiFixed(tx.fee, 8, 8, lbtcUnit)} ${LBTC_TICKER[network]}`}</IonCol>
            <IonCol className="ion-text-right" size="5" offset="1">
              <IonText>
                <TxStatus isConfirmed={tx.blockHeight !== undefined && tx.blockHeight > 0} />
              </IonText>
            </IonCol>
          </IonRow>
        )}
        <IonRow
          className="mt-1"
          onClick={async () => {
            clipboardCopy(await makeURLwithBlinders(Transaction.fromHex(txs[tx.txid].hex)), () => {
              addSuccessToast('Transaction ID copied');
            });
          }}
        >
          <IonCol offset="1">TxID: {tx.txid}</IonCol>
        </IonRow>
      </div>
    </IonItem>
  );
};

export default OperationListItem;
