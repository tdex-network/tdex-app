import React, { HTMLAttributes, PropsWithChildren } from 'react';
import { IonButton, IonCol, IonRow } from '@ionic/react';

interface ButtonsMainSubProps extends PropsWithChildren<HTMLAttributes<any>> {
  mainTitle: string;
  subTitle: string;
  mainLink?: string;
  subLink?: string;
  mainOnClick?: () => void;
  subOnClick?: () => void;
  mainDisabled?: boolean;
  subDisabled?: boolean;
}

const ButtonsMainSub: React.FC<ButtonsMainSubProps> = ({
  mainTitle,
  subTitle,
  mainLink,
  subLink,
  mainOnClick,
  subOnClick,
  mainDisabled,
  subDisabled,
  ...props
}) => {
  return (
    <IonRow className={`buttonsMainSub ${props.className}`}>
      <IonCol size="8" offset="2" sizeMd="6" offsetMd="3">
        <IonRow className="ion-justify-content-center">
          <IonButton
            className="main-button"
            disabled={mainDisabled}
            routerLink={mainLink}
            onClick={mainOnClick}
          >
            {mainTitle}
          </IonButton>
        </IonRow>
        <IonRow className="ion-justify-content-center">
          <IonButton
            className="sub-button"
            disabled={subDisabled}
            routerLink={subLink}
            onClick={subOnClick}
          >
            {subTitle}
          </IonButton>
        </IonRow>
      </IonCol>
    </IonRow>
  );
};

export default ButtonsMainSub;
