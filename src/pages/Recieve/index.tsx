import {
  IonPage,
  IonModal,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonToolbar,
  IonHeader,
  IonIcon,
} from '@ionic/react';
import React, { useRef, useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  IconBack,
  IconBTC,
  IconClose,
  IconCopy,
  IconSetup,
} from '../../components/icons';
import PageDescription from '../../components/PageDescription';
import './style.scss';
import { useSelector } from 'react-redux';
import { Clipboard } from '@ionic-native/clipboard';
// import { BarcodeScanner } from '@ionic-native/barcode-scanner';
// import { Base64 } from '@ionic-native/base64';
import { QRCodeImg } from '@cheprasov/react-qrcode';
import { checkmarkOutline } from 'ionicons/icons';
// import QRCode from 'react-qr-code';

const Recieve: React.FC<RouteComponentProps> = ({ history }) => {
  const { address } = useSelector((state: any) => ({
    assets: state.wallet.assets,
    transactions: state.transactions.data,
    address: state.wallet.address,
    coinsRates: state.wallet.coinsRates,
    currency: state.settings.currency,
  }));
  const [openModal, setOpenModal] = useState(false);
  const [copied, setCopied] = useState(false);
  // const [encodedText, setEncodedText] = useState<any>(false);
  // const [qrCode, setQRcode] = useState<any>(false);
  const addressRef: any = useRef(null);

  // const canvasRef: any = useRef(null);

  // useEffect(() => {
  //   console.log(encodedText);
  // }, [encodedText]);

  // const generateCode = () => {
  //   BarcodeScanner.encode(
  //     BarcodeScanner.Encode.TEXT_TYPE,
  //     address?.confidentialAddress
  //   ).then(
  //     (data) => {
  //       console.log(data.file);
  //       console.log(data);
  //       Base64.encodeFile(data.file).then((base64: any) => {
  //         console.log('file base64 encoding: ');
  //         console.log(base64);
  //         setQRcode(base64);
  //       });
  //       //this.setState({ textToEncode: encodedData });
  //     },
  //     (err) => {
  //       console.log(`Error occured : ${err.toString()}`);
  //     }
  //   );
  // };

  const copyAddress = () => {
    if (addressRef) {
      Clipboard.copy(address.confidentialAddress)
        .then((res: any) => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 5000);
        })
        .catch((e: any) => {
          addressRef.current.select();
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 10000);
        });
    }
  };

  // const scanCode = async () => {
  //   const data = await BarcodeScanner.scan();
  //   alert(JSON.stringify(data));
  //   setEncodedText(data.text);
  // };

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar className="with-back-button">
          <IonButton
            style={{ zIndex: 10 }}
            onClick={() => {
              history.goBack();
            }}
          >
            <IconBack />
          </IonButton>
          <IonTitle>Recieve</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="recieve">
        <div className="description-with-icon">
          <div className="img-wrapper">
            <IconBTC width="48px" height="48px" />
          </div>
          <PageDescription align="left" title="Your BTC address">
            <p>
              To provide this address to the person sending you Bitcoin simply
              tap to copy it or scan your wallet QR code with their device.
            </p>
          </PageDescription>
        </div>
        <input
          type="text"
          ref={addressRef}
          value={address?.confidentialAddress}
          readOnly={true}
          className="hidden-input"
        />
        <IonItem>
          <div
            // https://github.com/ionic-team/ionic-framework/issues/21939#issuecomment-694259307
            tabIndex={0}
          ></div>
          <div className="item-main-info">
            <div className="item-start conf-addr">
              {address?.confidentialAddress}
            </div>
            <div
              className="icon-wrapper copy-icon"
              onClick={() => copyAddress()}
            >
              {copied ? (
                <IonIcon
                  className="copied-icon"
                  color="success"
                  icon={checkmarkOutline}
                />
              ) : (
                <IconCopy
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#fff"
                />
              )}
            </div>
          </div>
        </IonItem>
        {/*<IonButton onClick={generateCode} color="success">*/}
        {/*  Create QR*/}
        {/*</IonButton>*/}
        {/*<IonButton onClick={scanCode} color="default">*/}
        {/*  Scan*/}
        {/*</IonButton>*/}
        {/*{address && <QRCode value={address.confidentialAddress} />}*/}
        {/*{address && <img src={qrCode} />}*/}
        <div className="qr-code-container">
          {address && (
            <QRCodeImg value={address.confidentialAddress} size={192} />
          )}
        </div>

        <IonModal cssClass="modal-big recieve" isOpen={openModal}>
          <div className="gradient-background"></div>
          <IonHeader>
            <IonToolbar className="with-back-button">
              <IonButton
                style={{ zIndex: 10 }}
                onClick={() => {
                  setOpenModal(false);
                }}
              >
                <IconClose />
              </IonButton>
              <IonTitle>Confirm withdrawal</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="description-with-icon">
              <IconSetup
                width="54"
                height="54"
                viewBox="0 0 54 54"
                fill="#fff"
              />

              <PageDescription align="left" title="Secret phrase">
                <p>
                  Your secret 12-word recovery phrase is the only way to recover
                  your funds if you lose access to your wallet. Write your
                  secret phrase on paper and store it in a safe deposit box.
                </p>
                <p>Insert the numeric password you’ve set at sign in</p>
              </PageDescription>
            </div>
            <div className="buttons">
              <IonButton className="main-button">Show backup phrase</IonButton>
              <IonButton
                onClick={() => {
                  setOpenModal(false);
                }}
                className="sub-button"
              >
                Skip
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Recieve);
