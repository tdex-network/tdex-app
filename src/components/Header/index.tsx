import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import classNames from 'classnames';
import { chevronBackOutline, closeOutline } from 'ionicons/icons';
import type { ReactElement } from 'react';
import React from 'react';
import './style.scss';

interface HeaderProps {
  defaultHref?: string;
  isTitleLarge?: boolean;
  handleBack?: () => void;
  handleClose?: () => void;
  hasBackButton: boolean;
  hasCloseButton?: boolean;
  title: string;
  customRightButton?: ReactElement;
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
          <IonButtons slot="end">{customRightButton}</IonButtons>
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
        <IonTitle
          className={classNames('ion-no-padding', {
            'title-large': isTitleLarge,
          })}
          data-cy="header-title"
        >
          {title}
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
