import { IonContent, IonHeader, IonPage } from '@ionic/react';
import React, { useState } from 'react';

//style
import './style.scss';

const QRScanner: React.FC<any> = () => {
  const [text] = useState('');

  return (
    <IonPage>
      <IonHeader style={{ background: 'red' }}></IonHeader>
      <IonContent>
        <p style={{ zIndex: 100 }}>{text}</p>
      </IonContent>
    </IonPage>
  );
};

export default QRScanner;
