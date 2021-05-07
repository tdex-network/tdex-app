import React from 'react';
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import classNames from 'classnames';
import './style.scss';

interface HeaderProps {
  isTitleLarge?: boolean;
  hasBackBtn: boolean;
  title: string;
}

const Header: React.FC<HeaderProps> = ({
  hasBackBtn,
  isTitleLarge = false,
  title,
}) => {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar
        className={classNames({
          'back-button': hasBackBtn,
        })}
      >
        {hasBackBtn && (
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" icon={chevronBackOutline} />
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
