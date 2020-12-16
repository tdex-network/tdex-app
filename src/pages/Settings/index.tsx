import {
  IonContent,
  IonList,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonToggle,
} from '@ionic/react';
import React from 'react';
import { IconRightArrow } from '../../components/icons';
import { withRouter } from 'react-router';
import './style.scss';

const Settings: React.FC<any> = ({ history }) => {
  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="settings">
        <IonList>
          <IonListHeader>General</IonListHeader>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/account');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Account </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/liquidity-provider');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Manage liquidity provider </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/currency');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Default currency </div>
              </div>
              <div className="item-end">
                <span className="chosen-currency green-label">EUR</span>
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/electrum');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Electrum server </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem className="list-item">
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Layout mode </div>
              </div>
              <div className="item-end">
                <span className="chosen-theme green-label">Dark</span>
                <IonToggle className="settings-toggle" checked={false} />
              </div>
            </div>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader>Support</IonListHeader>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/faq');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">FAQ </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
          <IonItem
            className="list-item"
            onClick={() => {
              history.push('/terms');
            }}
          >
            <div className="item-main-info">
              <div className="item-start">
                <div className="main-row">Terms & Conditions </div>
              </div>
              <div className="item-end">
                <IconRightArrow
                  className="next-icon"
                  fill="#fff"
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                />
              </div>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Settings);
