import React from 'react';
import { RouteComponentProps } from 'react-router';
import { IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import Header from '../../components/Header';
import './style.scss';

const Terms: React.FC<RouteComponentProps> = () => {
  return (
    <IonPage id="terms">
      <IonContent>
        <Header title="TERMS & CONDITIONS" hasBackButton={true} />
        <IonGrid>
          <IonRow>
            <IonCol>
              <h2>Premise</h2>
              <p>
                These terms and conditions (hereinafter referred to also as “T.
                & .C.”) represent the entire agreement between the user
                (hereinafter defined as “User” or in the plural as “Users”
                collectively) and Seven Labs Limited, a company duly registered
                and incorporated under the laws of Malta with Tax ID MT27141837
                and whose registered office is in “6, Villa Gauci, Mdina Road,
                Balzan, BZN, 09031 Malta EE (hereinafter referred to as the
                “Company”).
              </p>
              <p>
                By downloading, installing the TDEX App through or by proceeding
                with an update for the App when offered a choice of proceeding
                or not, Users agree to be bound by these T. & .C.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <ol>
                <li>
                  The User represents and warrants that he/she:
                  <ol type="a">
                    <li>
                      has the power and capacity to enter into this agreement;
                    </li>
                    <li>
                      deems to be a person who is very knowledgeable about
                      cryptocurrency generally and non-custodial wallets in
                      particular;
                    </li>
                    <li>
                      is perfectly aware of the risks commonly associated with
                      cryptocurrency generally and the use of non-custodial
                      wallets in particular.
                    </li>
                  </ol>
                </li>
                <li>
                  TDEX application (hereinafter referred to as the “App”) is a
                  reference application of the TEDX.Network open source project
                  (https://github.com/TDex-network/whitepaper). The App allows
                  users to access the TDEX protocol and might serve as a
                  non-custodial wallet for any Liquid Asset
                  (https://blockstream.com/liquid/).
                </li>
                <li>
                  The App may be downloaded on any available store or on Github
                  at the following link:{' '}
                  <a href="https://github.com/TDex-network">
                    https://github.com/TDex-network
                  </a>
                  . The App is provided on an “as is” and “as available” basis
                  without any representation or warranty of any kind, whether
                  express or implied, to the maximum extent permitted by
                  applicable laws. Specifically, the Company disclaims any
                  implied warranties of title, merchantability, fitness for a
                  particular purpose and/or non-infringement.
                </li>
                <li>
                  By downloading and installing the App users shall have access
                  to the following functions:
                  <ol type="a">
                    <li>
                      generate a PIN (Personal identification Number) and the
                      mnemonic phrase (the list of words that store all the
                      information needed for the recovery of your wallet) for
                      your non custodial wallet;
                    </li>
                    <li>receive and send any Liquid Asset;</li>
                    <li>
                      access and connect to TDEX.network for the swap of any
                      Liquid Asset with other Liquid Assets considering the
                      pairs offered by any Liquidity provider on the
                      TDEX.network.
                    </li>
                  </ol>
                </li>
                <li>
                  Users acknowledge that:
                  <ol type="a">
                    <li>
                      The Company does not store or have access to their
                      mnemonic phrase, PIN or private keys.
                    </li>
                    <li>
                      It is therefore their responsibility to carefully guard
                      the mnemonic phrase and PINs and to have a backup of the
                      private keys.
                    </li>
                    <li>
                      If a User forgets or loses his means of authentication the
                      Company has no way to recover them and the user may
                      permanently lose access to any Assets stored in the
                      wallet.
                    </li>
                    <li>
                      Therefore the Company has no responsibility and will not
                      be liable for any loss or damage a User may suffer from
                      the loss or misappropriation of his mnemonic phrase, PINs
                      and private keys.
                    </li>
                  </ol>
                </li>
                <li>
                  Users acknowledge that the App is based on an open source
                  project. Any further explanations regarding the functions of
                  the App shall be found on{' '}
                  <a href="https://github.com/TDex-network">
                    https://github.com/TDex-network
                  </a>
                  .
                </li>
                <li>
                  The App and TDEX protocol are under the MIT Licence (
                  <a href="https://github.com/TDex-network/tdex-specs/blob/master/LICENSE">
                    https://github.com/TDex-network/tdex-specs/blob/master/LICENSE
                  </a>
                  )
                </li>
                <li>
                  The App shall be used in accordance with the above MIT Licence
                </li>
                <li>
                  The App may be integrated with third party services. The
                  Company is not responsible for any third party services and
                  will not be liable for any loss or damage caused by third
                  party services.
                </li>
                <li>
                  The Company may add or remove functions or features of the
                  App. The User may always stop using the App at any time.
                </li>
                <li>
                  Users represent and warrant that they are using the App, in
                  accordance with applicable laws, and not for any purpose not
                  in compliance with applicable laws, including but not limited
                  to illegal gambling, fraud, money laundering or terrorist
                  activities.
                </li>
                <li>
                  In no event will the Company, its directors, officers,
                  employees, suppliers, agents or affiliates be liable for any
                  loss or damages, including without limitation, direct,
                  indirect, special, consequential, exemplary or punitive loss
                  or damages, arising from or related to the use of the App
                  including but not limited to loss of or inability to access or
                  transact data, profit and Digital Assets.
                  <ol type="a">
                    <li>
                      Without limiting the generality of the foregoing, the
                      Company takes no responsibility for and will not be liable
                      for any financial or other loss or damage arising from or
                      related to the use of the App including but not limited to
                      any of the following:
                      <ol type="i">
                        <li>
                          financial loss due to App access being "Brute-forced"
                        </li>
                        <li>financial loss due to data loss</li>
                        <li>financial loss due to hacks or unavailability</li>
                        <li>
                          financial loss due to forgotten mnemonics phrase, PINs
                          or passwords
                        </li>
                        <li>financial loss due to inability to transact.</li>
                        <li>
                          financial loss due to errors calculating network fees
                        </li>
                        <li>
                          financial loss due to incorrectly constructed
                          transactions or mistyped Liquid addresses
                        </li>
                        <li>
                          financial loss due to "phishing" or other websites
                          masquerading as TDEX
                        </li>
                      </ol>
                    </li>
                  </ol>
                </li>
                <li>
                  The Company takes no responsibility for, and will not be
                  liable for, the App being unavailable due to technical or
                  other issues beyond its control.
                </li>
                <li>
                  The total liability of the Company, its directors, officers,
                  employees, suppliers, agents or affiliates arising from or
                  related to the use of the App, in the aggregate for all
                  claims, is limited to 100.00 EUR.
                </li>
                <li>
                  Users will hold harmless and indemnify the Company, its
                  directors, officers, employees, suppliers, agents or
                  affiliates from and against any claim, suit or action arising
                  from or related to their use of the App or a violation of
                  these T. & .C, including any liability arising from claims,
                  losses, damages, suits, judgments, litigation costs and
                  attorneys’ fees.
                </li>
                <li>
                  The Company has no control over and does not make any
                  representations regarding the value of any Digital Asset, or
                  the operation of the underlying software protocols which
                  govern the operation of Digital Assets available on the
                  TDEX.Network. The Company assumes no responsibility for the
                  operation of the underlying protocols and is not able to
                  guarantee their functionality, security or availability.
                </li>
                <li>
                  The information contained on the Website tdex.network is for
                  general information purposes only. The Company makes no
                  representations or warranties of any kind, express or implied,
                  about the completeness, accuracy, reliability, suitability or
                  availability with respect to the Website tdex.network or the
                  information, products, services, or related graphics contained
                  on the Website tdex.network for any purpose. Any reliance a
                  User places on such information is therefore strictly at
                  his/her own risk.
                </li>
                <li>
                  Data Protection – Users acknowledge that the Company shall not
                  collect, use, store and process personal data in relation to
                  them in accordance with the Privacy Policy.
                </li>
                <li>
                  Governing law and dispute resolution - These T. & .C shall be
                  governed, interpreted and construed in accordance with Lex
                  Mercatoria.
                </li>
              </ol>

              <IonRow>
                <IonCol>
                  <p>
                    Users irrevocably agree that (a) the Maltes courts shall
                    have exclusive jurisdiction to settle any dispute which may
                    arise under or in connection with these T. & .C (including a
                    relating to the existence, validity or termination of these
                    T. & .C. or any non-contractual obligation arising out of or
                    connection with these T. & .C (an “Action”)); (b) the courts
                    of Malta are the most appropriate and convenient courts to
                    settle Actions and accordingly no party will argue to the
                    contrary; and (c) Sections (a) and (b) are for the benefit
                    of the Company only and, as a result, the Company shall not
                    be prevented from taking proceedings relating to an Action
                    in any other courts with jurisdiction. To the extent allowed
                    by law, the Company may take concurrent proceedings in any
                    number of jurisdictions.
                  </p>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Terms;
