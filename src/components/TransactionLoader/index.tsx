import { Clipboard } from '@ionic-native/clipboard';
import { IonItem, IonSkeletonText, IonSpinner } from '@ionic/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import {
  addErrorToast,
  addSuccessToast,
} from '../../redux/actions/toastActions';
import './style.scss';
import { UnableToCopyTxIDError } from '../../utils/errors';

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
          .catch(err => {
            console.error(err);
            dispatch(addErrorToast(UnableToCopyTxIDError));
          });
      }}
    >
      <div className="info-wrapper">
        <div className="item-main-info">
          <div className="item-start">
            <IonSpinner className="spinner-tx" name="crescent" />
            <div className="item-name">
              <IonSkeletonText animated style={{ width: '80px' }} />
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
