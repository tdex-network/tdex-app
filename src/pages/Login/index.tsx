import { IonContent, IonHeader, IonButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { ChangeEvent, useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import { RouteComponentProps, withRouter } from 'react-router';
import PageDescription from '../../components/PageDescription';
import PinInput from '../../components/PinInput';
import './style.scss';
import { IconBack, IconCheck } from '../../components/icons';

interface LoginInterface {
  setIsAuth: (value: boolean) => void,
}

const Login: React.FC<LoginInterface & RouteComponentProps> = ({setIsAuth, history}) => {
  const [inputValue, setValue] = useState("");
  const [firstPin, setFirstPin] = useState("");

  const inputRef: any = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  })

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;  

    setValue(value);
  }

  const onConfirm = () => {
    if (!firstPin) {
      setFirstPin(inputValue);
      setValue("");
    } else if (firstPin && inputValue && firstPin.localeCompare(inputValue)) {
      // setIsAuth(true)
      // history.replace("/");
    } else {
      setFirstPin("");
      setValue("");
    }
  }

  return (
    <IonPage>
      <div className="gradient-background"></div>
      <IonHeader>
        <IonToolbar className="with-back-button">
            <IonButton onClick={() => {history.goBack()}}>
              <IconBack />
            </IonButton>
            <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="login">
          {!firstPin ? (
            <PageDescription
              title="Set security PIN"
            >
              <p className="task-description">Your password must be 6 character long
              and must be set with only numbers</p>
            </PageDescription>
          ) : (
            <PageDescription
              title="Repeat PIN"
            >
              <p className="task-description">Insert again the numeric password,
              it must match the previous entry</p>
            </PageDescription>
              
          )}

          <PinInput 
            inputRef={inputRef}
            onChange={onChange}
            inputValue={inputValue}
          />

          {firstPin && (
            <label className="terms">
              
              <input type="checkbox" name="agreement"></input>
              <div className="custom-check">
                <div className="check-icon">
                  <IconCheck />
                </div>
              </div>
              I agree with <a href="/"> Terms and Conditions</a>
            </label>
          )}

        <div className="buttons login">
          <IonButton className={classNames(
            "main-button",
            {secondary: inputValue.length < 6}
          )} disabled={inputValue.length < 6} onClick={onConfirm}>Confirm</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withRouter(Login);
