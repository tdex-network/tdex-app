import './style.scss';

import { IonCol, IonRow } from '@ionic/react';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';

export interface PageDescriptionProps extends PropsWithChildren<any> {
  centerDescription?: boolean;
  description: string;
  title: string;
}

const PageDescription: React.FC<PageDescriptionProps> = ({ title, description, centerDescription = false }) => {
  return (
    <div className="page-description ion-margin-vertical">
      <IonRow>
        <IonCol className="ion-text-center" size="10" offset="1">
          <h2 data-testid="description-title">{title}</h2>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol
          className={classNames({
            'ion-text-center': centerDescription,
            'ion-text-left': !centerDescription,
          })}
          size="10"
          offset="1"
        >
          <p className="ion-no-margin" data-testid="description-p">
            {description}
          </p>
        </IonCol>
      </IonRow>
    </div>
  );
};

export default PageDescription;
