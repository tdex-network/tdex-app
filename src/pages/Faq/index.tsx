import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';
import React from 'react';

import Header from '../../components/Header';

const Faq: React.FC = () => {
  return (
    <IonPage id="faq">
      <IonContent>
        <IonGrid>
          <Header title="FAQ" hasBackButton={true} />
          <IonRow>
            <IonCol>
              <h2>What is TDEX App?</h2>
              <p>
                T(True)DEX App is the reference implementation of the open
                source{' '}
                <a href="https://github.com/TDex-network/tdex-specs">
                  TDEX protocol
                </a>
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>What is TDEX protocol?</h2>
              <p>
                It is the first-of-its-kind atomic-swap based decentralized
                exchange (DEX) protocol built on the Liquid Network. It is a
                community-oriented, open-source solution that aims to become the
                framework for a fast and secure secondary market for Liquid
                Assets. TDEX facilitates liquidity generation in a way that
                leverages Bitcoin's security but mitigates its privacy and
                fungibility shortcomings, thus strengthening the foundation for
                Liquid Finance (LiFi)—the Liquid Network's version of
                Decentralised Finance (DeFi).
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>What is the Liquid Network?</h2>
              <p>
                <a href="https://www.blockstream.com/liquid/">
                  The Liquid Network
                </a>{' '}
                is an Elements-based Bitcoin sidechain, developed by
                Blockstream. As a decentralised settlement network for traders
                and exchanges, it enables faster and truly confidential
                transactions in Bitcoin and Tether. Further, it facilitates the
                issuance of custom digital assets, a.k.a Issued Assets. A
                globally distributed Strong Federation secures and validates
                transactions on the network, thereby eliminating any single
                point of failure. To know more, read the{' '}
                <a href="https://blockstream.com/assets/downloads/pdf/liquid-whitepaper.pdf">
                  Liquid White Paper
                </a>
                .
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>How can I get Liquid Bitcoin (L-BTC)?</h2>
              <p>
                There are several ways of acquiring L-BTC, you can peg in BTC in
                the TDEX App or buy L-BTC from several third parties.
              </p>
              <p>
                Please have a look at the list of third party sources on Liquid
                official{' '}
                <a href="https://help.blockstream.com/hc/en-us/articles/900000630846-How-do-I-get-Liquid-Bitcoin-L-BTC">
                  website
                </a>
                .
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>What is an Atomic Swap? </h2>
              <p>
                Atomic Swap is a decentralised, peer-to-peer method for
                exchanging crypto-assets without involving any third-party
                intermediary. This is an instantaneous process, with almost
                real-time settlement, and wherein the counterparties are in
                complete control.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>What is a Confidential Transaction?</h2>
              <p>
                Any transaction has two main elements—amount and asset type.
                Confidential Transaction (CT) is a method for hiding this
                information, despite proving to any verifier that the input and
                output values add up to zero. Developed by Gregory Maxwell, CTs
                leverage Pedersen Commitments to eliminate double-spending and
                other risks, while upholding privacy. To know more, read{' '}
                <a href="https://eprint.iacr.org/2017/1066.pdf">
                  the paper on Bulletproofs
                </a>{' '}
                by Poelstra et al.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>Who is a Liquidity Provider?</h2>
              <p>
                A Liquidity Provider (Provider) on TDEX is, basically, the
                equivalent of what is commonly known as a market maker. They
                provide liquidity to the exchange’s tradeable asset pairs by
                holding mutually-pegged pairs comprising a Quote Asset and a
                Base Asset. This applies to any asset pair and not necessarily
                the bitcoin-pegged ones. TDEX incentivizes Providers to run
                always-on endpoints, which substantially resolves the problem of{' '}
                <a href="https://www.oxfordreference.com/view/10.1093/oi/authority.20110803095622703">
                  Double Coincidence of Wants
                </a>
                . The primary role of Provides on TDEX is to ensure that traders
                have readily available markets, which has been a consistent pain
                point for most DEXs. Traders, in turn, can discover Providers
                using the TDEX App or any other end-point based on the TDEX SDK.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>Can I become a Liquidity Provider on TDEX?</h2>
              <p>
                Yes, of course. TDEX is open-source, meaning anyone can join as
                a liquidity provider or a trader or a developer. To participate
                as a Provider, you have to{' '}
                <a href="https://docs.tdex.network/tdex-daemon.html">
                  run an always on server (Daemon)
                </a>{' '}
                on the network—in accordance with the{' '}
                <a href="https://github.com/tdex-network/tdex-specs/blob/master/04-trade-protocol.md">
                  Trade Protocol
                </a>
                —either by running it through Docker or as a Standalone entity.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>I lost my PIN, help!</h2>
              <p>
                Forgetting your PIN is not a very big issue, as long as you
                remember your mnemonic. If you can’t log in to your wallet using
                the PIN, you can restore it using the mnemonic.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>I lost my mnemonic, help! </h2>
              <p>
                Sorry for your loss, but there’s no way to retrieve your
                mnemonic if you lose it. TDEX doesn't have access to your
                mnemonic and can’t help you in this case. Ideally, it’s
                advisable to write your mnemonic down and store it safely.
                However, if you do remember your PIN, you can use it to login
                and retrieve your mnemonic from the wallet’s settings menu.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>How to reinstall TDEX App, help! </h2>
              <p>
                Never delete your App before deleting the mnemonic if you want
                to wipe out and reinstall fresh. So, before deleting your app
                you need hit Settings menu &#62; Account &#62; Delete mnemonic.
                Now you can delete your App and start fresh!
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>
                Will I lose access to my Liquid Assets if my smartphone is
                stolen?
              </h2>
              <p>
                Relax! You don't have to worry if your smartphone has been
                stolen, but the mnemonic phrase is not compromised. To regain
                access to your Liquid Assets, all you need to do is reinstall
                the TDEX app and the wallet on your new device. However, make
                sure that your mnemonic isn't stolen, because that is what’s
                ultimately required to access your assets, not just the physical
                device.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>What does TDEX App charge for the service? </h2>
              <p>
                TDEX is a truly decentralized, open-source project with a
                dedicated community orientation. By design, the protocol doesn't
                charge any fees, in and of itself, at least. However, Liquidity
                Providers might charge a fee for the service that they offer,
                namely providing and maintaining liquidity for asset pairs so
                that you can perform swap-based trades.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>Who receives the transaction fee that I’m paying?</h2>
              <p>
                Fees are paid to the liquidity providers running daemons on the
                TDEX network.
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>Which platforms are compatible with TDEX App? </h2>
              <p>
                TDEX App has an application for Android, which is available on
                Google Play Store, and one for iOS, which you can get from the
                Apple Store. Furthermore, since TDEX is open-source and has a
                robust Software Development Kit (SDK), you can build your custom
                apps. You can also contribute to the protocol’s development on{' '}
                <a href="https://github.com/TDex-network">GitHub</a>
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>
                My question isn't answered in this FAQ. How can I contact you?
              </h2>
              <p>
                TDEX is an open-source project, so you can rely on community
                support. The primary method of requesting support from the
                community is through TDEX’s{' '}
                <a href="https://github.com/TDex-network/support/issues/new">
                  official GitHub Channel
                </a>
                .
              </p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <p>
                You can also ask on the community channel on{' '}
                <a href="https://t.me/tdexnetwork">Telegram</a>
              </p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Faq;
