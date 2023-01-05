import { IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Header from '../../components/Header';

const Faq: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage id="faq">
      <IonContent>
        <IonGrid>
          <Header title="FAQ" hasBackButton={true} />
          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t1')}</h2>
              <Trans
                i18nKey="settings.support.faq.p1"
                components={[
                  <a target="__blank" href="https://dev.tdex.network/docs/specs/index">
                    TDEX protocol
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t2')}</h2>
              <p>{t('settings.support.faq.p2')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t3')}</h2>
              <Trans
                i18nKey="settings.support.faq.p3"
                components={[
                  <a target="__blank" href="https://www.blockstream.com/liquid/">
                    The Liquid Network
                  </a>,
                  <a target="__blank" href="https://blockstream.com/assets/downloads/pdf/liquid-whitepaper.pdf">
                    Liquid White Paper
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t4')}</h2>
              <Trans
                i18nKey="settings.support.faq.p4"
                components={[
                  <a
                    target="__blank"
                    href="https://help.blockstream.com/hc/en-us/articles/900000630846-How-do-I-get-Liquid-Bitcoin-L-BTC"
                  >
                    Liquid official website
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t5')}</h2>
              <p>{t('settings.support.faq.p5')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t6')}</h2>
              <Trans
                i18nKey="settings.support.faq.p6"
                components={[
                  <a target="__blank" href="https://eprint.iacr.org/2017/1066.pdf">
                    the paper on Bulletproofs
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t7')}</h2>
              <Trans
                i18nKey="settings.support.faq.p7"
                components={[
                  <a
                    target="__blank"
                    href="https://www.oxfordreference.com/view/10.1093/oi/authority.20110803095622703"
                  >
                    Double Coincidence of Wants
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t8')}</h2>
              <Trans
                i18nKey="settings.support.faq.p8"
                components={[
                  <a target="__blank" href="https://dev.tdex.network/docs/provider/intro">
                    run an always on server (Daemon)
                  </a>,
                  <a target="__blank" href="https://dev.tdex.network/docs/specs/trade-protocol">
                    Trade Protocol
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t9')}</h2>
              <p>{t('settings.support.faq.p9')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t10')}</h2>
              <p>{t('settings.support.faq.p10')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t11')}</h2>
              <p>{t('settings.support.faq.p11')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t12')}</h2>
              <p>{t('settings.support.faq.p12')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t13')}</h2>
              <p>{t('settings.support.faq.p13')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t14')}</h2>
              <p>{t('settings.support.faq.p14')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t15')}</h2>
              <p>{t('settings.support.faq.p15')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t16')}</h2>
              <p>{t('settings.support.faq.p16')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t17')}</h2>
              <p>{t('settings.support.faq.p17')}</p>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t18')}</h2>
              <Trans
                i18nKey="settings.support.faq.p18"
                components={[
                  <a target="__blank" href="https://github.com/tdex-network">
                    GitHub
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>{t('settings.support.faq.t19')}</h2>
              <Trans
                i18nKey="settings.support.faq.p19"
                components={[
                  <a target="__blank" href="https://github.com/tdex-network/support/issues/new">
                    official GitHub Channel
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <Trans
                i18nKey="settings.support.faq.p20"
                components={[
                  <a target="__blank" href="https://t.me/tdexnetwork">
                    Telegram
                  </a>,
                ]}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Faq;
