import React from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { chevronBackOutline, closeOutline } from 'ionicons/icons';
import classNames from 'classnames';
import './style.scss';

interface HeaderProps {
  defaultHref?: string;
  isTitleLarge?: boolean;
  handleBack?: () => void;
  handleClose?: () => void;
  hasBackButton: boolean;
  hasCloseButton?: boolean;
  title: string;
  customRightButton?: string;
  handleCustomRightButton?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  defaultHref,
  handleBack,
  handleClose,
  hasBackButton,
  hasCloseButton,
  isTitleLarge = false,
  title,
  customRightButton,
  handleCustomRightButton,
}) => {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar
        className={classNames({
          'back-button': hasBackButton,
          'close-button': hasCloseButton,
        })}
      >
        {customRightButton && hasCloseButton && (
          <IonButtons slot="end">
            <IonButton
              className="custom-right-button"
              onClick={handleCustomRightButton}
            >
              <img src={customRightButton} alt="custom" />
            </IonButton>
          </IonButtons>
        )}
        {!customRightButton && hasCloseButton && (
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        )}
        {hasBackButton && (
          <IonButtons slot="start">
            {handleBack ? (
              <IonButton onClick={handleBack}>
                <IonIcon slot="icon-only" icon={chevronBackOutline} />
              </IonButton>
            ) : (
              <IonBackButton
                defaultHref={defaultHref ?? '/homescreen'}
                text=""
                icon={chevronBackOutline}
              />
            )}
          </IonButtons>
        )}
        <IonTitle className={classNames({ 'title-large': isTitleLarge })}>
          {title}
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
