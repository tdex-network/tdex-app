import './style.scss';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonPage,
  IonRow,
  useIonViewDidLeave,
} from '@ionic/react';
import Decimal from 'decimal.js';
import { address, Creator, networks, Updater } from 'liquidjs-lib';
import React, { useEffect, useState } from 'react';
import type { RouteComponentProps } from 'react-router';
import { useParams } from 'react-router';

import ButtonsMainSub from '../../components/ButtonsMainSub';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import PinModal from '../../components/PinModal';
import WithdrawRow from '../../components/WithdrawRow';
import { IconQR } from '../../components/icons';
import { WsElectrumChainSource } from '../../services/chainSource';
import { SignerService } from '../../services/signerService';
import { ElectrumWS } from '../../services/ws/ws-electrs';
import { useAppStore } from '../../store/appStore';
import { useAssetStore } from '../../store/assetStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import type { Recipient } from '../../store/walletStore';
import { useWalletStore } from '../../store/walletStore';
import { decodeBip21 } from '../../utils/bip21';
import type { LbtcDenomination, NetworkString } from '../../utils/constants';
import { LBTC_ASSET, PIN_TIMEOUT_FAILURE, PIN_TIMEOUT_SUCCESS } from '../../utils/constants';
import { decrypt } from '../../utils/crypto';
import { IncorrectPINError, WithdrawTxError } from '../../utils/errors';
import { fromLbtcToUnit, fromSatoshi, isLbtc, isLbtcTicker, toSatoshi } from '../../utils/helpers';
import { onPressEnterKeyCloseKeyboard } from '../../utils/keyboard';

type LocationState = {
  address: string;
  amount: string;
  asset: string;
  lbtcUnit?: LbtcDenomination;
  precision?: number;
  network?: NetworkString;
};

export const Withdrawal: React.FC<RouteComponentProps<any, any, LocationState>> = ({ history, location }) => {
  const setIsFetchingUtxos = useAppStore((state) => state.setIsFetchingUtxos);
  const assets = useAssetStore((state) => state.assets);
  const network = useSettingsStore((state) => state.network);
  const lbtcUnit = useSettingsStore((state) => state.lbtcDenomination);
  const addErrorToast = useToastStore((state) => state.addErrorToast);
  const addSuccessToast = useToastStore((state) => state.addSuccessToast);
  const balances = useWalletStore((state) => state.balances);
  const encryptedMnemonic = useWalletStore((state) => state.encryptedMnemonic);
  const getNextAddress = useWalletStore((state) => state.getNextAddress);
  const selectUtxos = useWalletStore((state) => state.selectUtxos);
  //
  const { asset_id } = useParams<{ asset_id: string }>();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [needReset, setNeedReset] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isWrongPin, setIsWrongPin] = useState<boolean | null>(null);

  useIonViewDidLeave(() => {
    setRecipientAddress('');
  });

  useEffect(() => {
    if (location.state) {
      setRecipientAddress(location.state.address);
      setAmount(location.state.amount);
    }
  }, [location]);

  // Check amount validity
  useEffect(() => {
    try {
      if (!balances?.[asset_id]) return;
      if (
        fromSatoshi(
          balances[asset_id].value.toString(),
          assets[asset_id].precision,
          isLbtc(asset_id, network) ? lbtcUnit : undefined
        ).lessThan(amount || '0')
      ) {
        setError('Amount is greater than your balance');
        return;
      }
      //
      const LBTCBalance = balances[LBTC_ASSET[network].assetHash].value;
      if (!LBTCBalance || LBTCBalance === 0) {
        setError('You need LBTC to pay fees');
        return;
      }
      // No error
      setError('');
    } catch (err) {
      console.error(err);
    }
  }, [amount, asset_id, assets, balances, lbtcUnit, network]);

  const getRecipient = (): Recipient => ({
    address: recipientAddress?.trim(),
    asset: asset_id,
    value: toSatoshi(
      amount || '0',
      assets[asset_id]?.precision,
      isLbtcTicker(assets[asset_id]?.ticker || '') ? lbtcUnit : undefined
    ).toNumber(),
  });

  const isValid = (): boolean => {
    if (error) return false;
    if (!balances?.[asset_id].value || new Decimal(amount || '0').lessThanOrEqualTo(0)) return false;
    return recipientAddress !== '';
  };

  const createTxAndBroadcast = async (pin: string) => {
    try {
      if (!isValid()) return;
      setLoading(true);
      try {
        // Check pin
        if (!encryptedMnemonic) throw new Error('No mnemonic found in wallet');
        await decrypt(encryptedMnemonic, pin);
        setIsWrongPin(false);
        setTimeout(() => {
          setIsWrongPin(null);
          setNeedReset(true);
        }, PIN_TIMEOUT_SUCCESS);
      } catch (_) {
        throw IncorrectPINError;
      }
      // Craft single recipient Pset v2
      const pset = Creator.newPset();
      const coinSelection = await selectUtxos([getRecipient()], true);
      const updater = new Updater(pset);
      // Update tx
      // get the witness utxos from repository
      /*
      const witnessUtxos = await Promise.all(
        coinSelection.utxos.map((utxo) => {
          return getWitnessUtxo(utxo.txid, utxo.vout);
        })
      );
      updater.addInputs(
        coinSelection.utxos.map((utxo, i) => ({
          txid: utxo.txid,
          txIndex: utxo.vout,
          sighashType: Transaction.SIGHASH_ALL,
          witnessUtxo: witnessUtxos[i],
        }))
      );
      */
      updater.addOutputs([
        {
          asset: getRecipient().asset,
          amount: getRecipient().value,
          script: address.toOutputScript(getRecipient()?.address ?? '', networks[network]),
          blinderIndex: 0,
          blindingPublicKey: address.fromConfidential(getRecipient()?.address ?? '').blindingKey,
        },
      ]);
      if (coinSelection.changeOutputs && coinSelection.changeOutputs.length > 0) {
        const changeScriptDetail = await getNextAddress(true);
        updater.addOutputs([
          {
            asset: coinSelection.changeOutputs[0].asset,
            amount: coinSelection.changeOutputs[0].amount,
            script: Buffer.from(changeScriptDetail.script, 'hex'),
            blinderIndex: 0,
            blindingPublicKey: changeScriptDetail.blindingPublicKey
              ? Buffer.from(changeScriptDetail.blindingPublicKey, 'hex')
              : undefined,
          },
        ]);
      }

      const feeAmount = 360;
      //const millisatoshiPerByte = 110;
      // const size = updater.pset.estimateVirtualSize();
      //console.log(size);
      //const feeAmount = Math.ceil(updater.pset.estimateVirtualSize() * (millisatoshiPerByte / 1000));

      if (getRecipient().asset === networks[network].assetHash && updater.pset.outputs.length > 1) {
        // subtract fee from change output
        updater.pset.outputs[1].value = updater.pset.outputs[1].value - feeAmount;
      } else {
        // reselect
        const newCoinSelection = await selectUtxos([{ asset: networks[network].assetHash, value: feeAmount }], true);
        /*
        const newWitnessUtxos = await Promise.all(
          newCoinSelection.utxos.map((utxo) => getWitnessUtxo(utxo.txid, utxo.vout))
        );
        updater.addInputs(
          newCoinSelection.utxos.map((utxo, i) => ({
            txid: utxo.txid,
            txIndex: utxo.vout,
            sighashType: Transaction.SIGHASH_ALL,
            witnessUtxo: newWitnessUtxos[i],
          }))
        );
        */
        if (newCoinSelection.changeOutputs && newCoinSelection.changeOutputs.length > 0) {
          const changeScriptDetail = await getNextAddress(true);
          updater.addOutputs([
            {
              asset: newCoinSelection.changeOutputs[0].asset,
              amount: newCoinSelection.changeOutputs[0].amount,
              script: Buffer.from(changeScriptDetail.script, 'hex'),
              blinderIndex: 0,
              blindingPublicKey: changeScriptDetail.blindingPublicKey
                ? Buffer.from(changeScriptDetail.blindingPublicKey, 'hex')
                : undefined,
            },
          ]);
        }
        // add the fee output
        updater.addOutputs([
          {
            asset: networks[network].assetHash,
            amount: feeAmount,
          },
        ]);
      }

      // setFeeStr(fromSatoshiStr(feeAmount, 8) + ' L-BTC');

      // blind all the outputs except fee
      /*
      const recipientData = address.fromConfidential(recipientAddress);
      const recipientScript = address.toOutputScript(recipientData.unconfidentialAddress);
      const outputsToBlind: number[] = [];
      const blindKeyMap = new Map<number, string>();
      psetToUnsignedTx(withdrawPset).outs.forEach((out, index) => {
        if (out.script.length === 0) return;
        outputsToBlind.push(index);
        if (out.script.equals(recipientScript)) blindKeyMap.set(index, recipientData.blindingKey.toString('hex'));
      });
      const blindedPset = await blindPset(withdrawPset, outputsToBlind, blindKeyMap);
      */

      const signer = await SignerService.fromPin(pin);
      const signedPset = await signer.signPset(updater.pset);
      const toBroadcast = signer.finalizeAndExtract(signedPset);
      // Broadcast tx
      const websocketExplorerURL = useSettingsStore.getState().websocketExplorerURL;
      const client = new ElectrumWS(websocketExplorerURL);
      const chainSource = new WsElectrumChainSource(client);
      const txid = await chainSource.broadcastTransaction(toBroadcast);
      //
      addSuccessToast(`Transaction broadcasted. ${amount} ${assets[asset_id]?.ticker} sent.`);
      // watchTransaction(txid);
      // Trigger spinner right away
      setIsFetchingUtxos(true);
      // But update after a few seconds to make sure new utxo is ready to fetch
      // setTimeout(() => updateUtxos(), 12_000);
      history.replace(`/transaction/${txid}`, {
        address: recipientAddress,
        amount: `-${amount}`,
        asset: asset_id,
        lbtcUnit,
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(null);
        setNeedReset(true);
      }, PIN_TIMEOUT_FAILURE);
      // unlockUtxos();
      addErrorToast(WithdrawTxError);
    } finally {
      setModalOpen(false);
      setLoading(false);
    }
  };

  return (
    <IonPage id="withdrawal">
      <PinModal
        open={modalOpen}
        title="Unlock your seed"
        description={`Enter your secret PIN to send ${amount} ${
          isLbtcTicker(assets[asset_id]?.ticker || '') ? lbtcUnit : assets[asset_id]?.ticker
        }.`}
        onConfirm={createTxAndBroadcast}
        onClose={() => {
          setModalOpen(false);
        }}
        isWrongPin={isWrongPin}
        needReset={needReset}
        setNeedReset={setNeedReset}
        setIsWrongPin={setIsWrongPin}
      />
      <Loader showLoading={loading} delay={0} />
      <IonContent className="withdrawal">
        <IonGrid>
          <Header title={`Send ${assets[asset_id]?.ticker.toUpperCase() ?? ''}`} hasBackButton={true} />
          {balances?.[asset_id] && (
            <WithdrawRow
              amount={amount}
              asset={assets[asset_id]}
              balance={balances[asset_id]}
              setAmount={setAmount}
              error={error}
              network={network}
            />
          )}

          <IonItem className="address-input">
            <IonInput
              name="input-addr-withdraw"
              data-testid="input-addr-withdraw"
              inputmode="text"
              enterkeyhint="done"
              onKeyDown={onPressEnterKeyCloseKeyboard}
              value={recipientAddress}
              placeholder="Paste address here or scan QR code"
              onIonChange={(ev) => {
                if (ev.detail.value) {
                  if (ev.detail.value.startsWith('liquidnetwork')) {
                    const { address, options } = decodeBip21(ev.detail.value, 'liquidnetwork');
                    setRecipientAddress(address);
                    if (options?.amount) {
                      // Treat the amount as in btc unit
                      // Convert to user favorite unit, taking into account asset precision
                      const unit = isLbtc(asset_id || '', network) ? lbtcUnit : undefined;
                      const amtConverted = fromLbtcToUnit(
                        new Decimal(options?.amount as string),
                        unit,
                        assets[asset_id]?.precision
                      ).toString();
                      setAmount(amtConverted);
                    }
                  } else {
                    setRecipientAddress(ev.detail.value);
                  }
                }
              }}
            />
            <IonButton
              className="scan-btn"
              onClick={() =>
                history.replace(`/qrscanner/${asset_id}`, {
                  amount,
                  address: '',
                  asset: asset_id,
                  lbtcUnit: lbtcUnit,
                  precision: assets[asset_id]?.precision,
                  network: network,
                })
              }
            >
              <IconQR fill="#fff" />
            </IonButton>
          </IonItem>

          <IonRow className="ion-margin-vertical-x2">
            <IonCol>
              <ButtonsMainSub
                mainTitle="CONFIRM"
                subTitle="CANCEL"
                mainOnClick={() => setModalOpen(true)}
                mainDisabled={!isValid()}
                subOnClick={history.goBack}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
