import React from 'react';
import { IonItem, IonSkeletonText, IonSpinner } from '@ionic/react';
import { Clipboard } from '@ionic-native/clipboard';
import { useDispatch } from 'react-redux';
import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import './style.scss';
import { UnableToCopyTxID } from '../../utils/errors';

interface TransactionLoaderProps {
  txID: string;
}

const TransactionLoader: React.FC<TransactionLoaderProps> = ({ txID }) => {
  const dispatch = useDispatch();
  return (
    <IonItem
      key={txID}
      className="list-item transaction-item tx-loader"
      onClick={() => {
        Clipboard.copy(txID)
          .then(() => dispatch(addSuccessToast('Tx ID copied in clipboard')))
          .catch((err) => {
            console.error(err);
            dispatch(addErrorToast(UnableToCopyTxID));
          });
      }}
    >
      <div className="info-wrapper">
        <div className="item-main-info">
          <div className="item-start">
            <IonSpinner className="spinner-tx" name="crescent" />
            <div className="item-name">
              <div className="main-row text-loader">{txID}</div>
              <div className="sub-row">
                <IonSkeletonText animated style={{ width: '80px' }} />
              </div>
            </div>
          </div>
          <div className="item-end">
            <div className="amount">
              <div className="main-row">
                <IonSkeletonText animated style={{ width: '56px' }} />
              </div>
              <div className="main-row accent">
                <IonSkeletonText animated style={{ width: '32px' }} />
              </div>
            </div>
            <div className="sub-row ta-end">
              <IonSkeletonText animated style={{ width: '100px' }} />
            </div>
          </div>
        </div>
      </div>
    </IonItem>
  );
};

export default TransactionLoader;
