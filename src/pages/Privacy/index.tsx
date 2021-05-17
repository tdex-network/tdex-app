import React from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';
import Header from '../../components/Header';

const Privacy: React.FC = () => {
  return (
    <IonPage id="privacy">
      <IonContent>
        <Header title="PRIVACY POLICY" hasBackButton={true} />
        <IonGrid>
          <IonRow>
            <IonCol>
              <p>
                Every Individual should have an inalienable right to privacy. In
                a world where technology is increasingly used to identify,
                monitor and track users, TDex App takes steps in the opposite
                direction. The TDex app does not collect or share your
                information. That’s our policy in a nutshell.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h3>TDex App Privacy Policy</h3>

              <h2>Information we don’t collect</h2>
              <p>
                TDex App doesn’t store any identifying information about your
                device, such as your IP address or your user agents or your
                transactions. TDex App is designed so that it doesn’t store any
                information. You don’t need a phone number, e-mail, or any
                information tied to your identity or your Liquid Assets to use
                the TDex App. TDex App is private by default.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>Information we share</h2>
              <p>
                If you use TDex App on your Android or iOS phone, Google or
                Apple might store information about how you use the app. They
                can record when the app is closed, opened, how long you use it
                for, crash logs, and your device model. This usage information
                could also be associated with your Google or Apple account, and
                it is shared with us. This is a limitation of mobile operating
                systems, and applies to all apps used on your device. Besides
                this, we don’t share any of your information with Apple, Google,
                or anyone else.
              </p>
              <p>
                If you’re planning to use TDex App on mobile, it’s worth reading
                Apple or Google’s privacy policies. If you’re using iOS, check
                out Apple’s App Store Review Guidelines. For Android, read the
                User Data section of Google’s Developer Policy Center. Also, If
                you download TDex app and install manually with the apk from
                TDex GitHub repository check GitHub Privacy Statement.
              </p>
              <p>
                Furthermore, TDex relies on Blockstream.info/liquid as the data
                source of Liquid Blockchain by default, but you can change from
                Settings &#62; Electrum server. For FIAT amounts conversion it
                relies on CoinGecko public APIs. Also TDex App has no influence
                and/or awareness of if and how TDex Liquidity Providers collect
                or use data related to atomic swap transactions.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <p>This policy is effective as of 6 May 2021</p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Privacy;
