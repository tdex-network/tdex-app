import React from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';
import Header from '../../components/Header';

const Privacy: React.FC = () => {
  return (
    <IonPage id="privacy">
      <IonContent>
        <IonGrid>
          <Header title="PRIVACY POLICY" hasBackButton={true} />
          <IonRow>
            <IonCol>
              <p>
                Every Individual should have an inalienable right to privacy. In
                a world where technology is increasingly used to identify,
                monitor and track users, TDEX App takes steps in the opposite
                direction. The TDEX app does not collect or share your
                information. That’s our policy in a nutshell.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h3>TDEX App Privacy Policy</h3>

              <h2>Information we don’t collect</h2>
              <p>
                TDEX App doesn’t store any identifying information about your
                device, such as your IP address or your user agents or your
                transactions. TDEX App is designed so that it doesn’t store any
                information. You don’t need a phone number, e-mail, or any
                information tied to your identity or your Liquid Assets to use
                the TDEX App. TDEX App is private by default.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>Information that are shared with TDEX App</h2>
              <p>
                If you use the TDEX App on your Android or iOS phone, Google or
                Apple might store information about how you use the app. They
                can record when the app is closed, opened, how long you use it
                for, crash logs, and your device model. This usage information
                could also be associated with your Google or Apple account. The
                only information that TDEX App receives is the number of
                downloads and crashes.
              </p>
              <p>
                If you’re planning to use TDEX App on mobile, it’s worth reading
                Apple or Google’s privacy policies. If you’re using iOS, check
                out Apple’s App Store Review Guidelines. For Android, read the
                User Data section of Google’s Developer Policy Center. Also, If
                you download TDEX app and install it manually with the apk from
                TDEX GitHub repository check GitHub Privacy Statement.
              </p>
              <p>
                Furthermore, TDEX relies on Blockstream.info/liquid as the data
                source of Liquid Blockchain by default, but you can change from
                Settings &#62; Electrum server. For FIAT amounts conversion it
                relies on CoinGecko public APIs. Also TDEX App has no influence
                and/or awareness of if and how TDEX Liquidity Providers collect
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
