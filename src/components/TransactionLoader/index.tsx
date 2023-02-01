import './style.scss';

import { IonItem, IonSkeletonText, IonSpinner } from '@ionic/react';

import { useToastStore } from '../../store/toastStore';
import { clipboardCopy } from '../../utils/clipboard';


interface TransactionLoaderProps {
  txID: string;
}

const TransactionLoader: React.FC<TransactionLoaderProps> = ({ txID }) => {
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  return (
    <IonItem
      key={txID}
      className="list-item transaction-item tx-loader"
      onClick={() => {
        clipboardCopy(txID, () => {
          addSuccessToast('Tx ID copied in clipboard');
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
