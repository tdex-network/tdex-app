import { IonCol, IonRow } from '@ionic/react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import './style.scss';

export interface PageDescriptionProps extends PropsWithChildren<any> {
  description: string;
  title: string;
}

const PageDescription: React.FC<PageDescriptionProps> = ({
  title,
  description,
}) => {
  return (
    <div className="page-description ion-margin-vertical">
      <IonRow>
        <IonCol className="ion-text-center" size="10" offset="1">
          <h2>{title}</h2>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size="10" offset="1">
          <p className="ion-no-margin">{description}</p>
        </IonCol>
      </IonRow>
    </div>
  );
};

export default PageDescription;
