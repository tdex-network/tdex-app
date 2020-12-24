import { takeLatest, call, put, select } from 'redux-saga/effects';
import { TradeType } from 'tdex-sdk';
import {
  SET_SEND_ASSET,
  SET_SEND_AMOUNT,
  ESTIMATE_SEND_AMOUNT,
  SET_RECEIVE_ASSET,
  SET_RECEIVE_AMOUNT,
  ESTIMATE_RECEIVE_AMOUNT,
  SWAP_ASSETS,
  setMarket,
  setTradeType,
  setReceiveAsset,
  setSendAmount,
  setReceiveAmount,
  setTradable,
} from '../../../redux/actions/exchange/tradeActions';
import { getIdentity } from '../../services/walletService';
import {
  findMarketByAssets,
  previewPrice,
} from '../../services/exchange/providerService';
import { ActionType } from '../../../utils/types';
import { fromSatoshi } from '../../../utils/helpers';

function* setTradableSaga() {
  const { sendAmount, receiveAmount } = yield select((state: any) => ({
    sendAmount: state.exchange.trade.sendAmount,
    receiveAmount: state.exchange.trade.receiveAmount,
  }));

  yield put(setTradable(sendAmount > 0 && receiveAmount > 0));
}

function* setMarketAndTradeTypeSaga() {
  const { providerMarkets, sendAsset, receiveAsset } = yield select(
    (state: any) => ({
      providerMarkets: state.exchange.provider.markets,
      sendAsset: state.exchange.trade.sendAsset,
      receiveAsset: state.exchange.trade.receiveAsset,
    })
  );

  const market = yield call(findMarketByAssets, providerMarkets, [
    sendAsset,
    receiveAsset,
  ]);

  yield put(setMarket(market));
  yield call(setTradeTypeSaga);
}

function* setTradeTypeSaga() {
  const { market, sendAsset } = yield select((state: any) => ({
    market: state.exchange.trade.market,
    sendAsset: state.exchange.trade.sendAsset,
  }));

  const tradeType =
    market?.baseAsset == sendAsset ? TradeType.SELL : TradeType.BUY;

  yield put(setTradeType(tradeType));
}

function* swapAssetsSaga() {
  yield call(setTradeTypeSaga);
  yield put(setSendAmount(0));
  yield put(setReceiveAmount(0));
}

function* selectCounterAssetSaga() {
  const { providerMarkets, sendAsset, receiveAsset } = yield select(
    (state: any) => ({
      providerMarkets: state.exchange.provider.markets,
      sendAsset: state.exchange.trade.sendAsset,
      receiveAsset: state.exchange.trade.receiveAsset,
    })
  );

  if (!findMarketByAssets(providerMarkets, [sendAsset, receiveAsset])) {
    const market = yield call(findMarketByAssets, providerMarkets, [sendAsset]);
    const counterAsset =
      sendAsset == market.baseAsset ? market.quoteAsset : market.baseAsset;

    yield put(setReceiveAsset(counterAsset));
  }
}

function* previewPriceSaga({ type }: ActionType) {
  try {
    const {
      seed,
      endpoint,
      market,
      sendAsset,
      receiveAsset,
      sendAmount,
      receiveAmount,
      tradeType,
    } = yield select((state: any) => ({
      seed: state.wallet.mnemonic,
      endpoint: state.exchange.provider.endpoint,
      market: state.exchange.trade.market,
      sendAsset: state.exchange.trade.sendAsset,
      sendAmount: state.exchange.trade.sendAmount,
      receiveAsset: state.exchange.trade.receiveAsset,
      receiveAmount: state.exchange.trade.receiveAmount,
      tradeType: state.exchange.trade.tradeType,
    }));

    const identity = yield call(getIdentity, seed, false);

    const { amount, asset, setAmountAction } =
      type == ESTIMATE_RECEIVE_AMOUNT
        ? {
            amount: sendAmount,
            asset: sendAsset,
            setAmountAction: setReceiveAmount,
          }
        : {
            amount: receiveAmount,
            asset: receiveAsset,
            setAmountAction: setSendAmount,
          };

    let estimatedAmount;

    try {
      const preview = yield call(previewPrice, {
        endpoint,
        market,
        amount,
        asset,
        tradeType,
        identity,
      });

      estimatedAmount = fromSatoshi(
        type == ESTIMATE_RECEIVE_AMOUNT
          ? preview.amountToReceive
          : preview.amountToBeSent
      );
    } catch (error) {
      console.log(error);
      estimatedAmount = 0;
    }

    yield put(setAmountAction(estimatedAmount));
  } catch (error) {
    console.log(error);
  }
}

export function* tradeWatcherSaga() {
  yield takeLatest([SET_SEND_AMOUNT, SET_RECEIVE_AMOUNT], setTradableSaga);
  yield takeLatest(SWAP_ASSETS, swapAssetsSaga);
  yield takeLatest(
    [SET_SEND_ASSET, SET_RECEIVE_ASSET],
    setMarketAndTradeTypeSaga
  );
  yield takeLatest(SET_SEND_ASSET, selectCounterAssetSaga);
  yield takeLatest(
    [ESTIMATE_SEND_AMOUNT, ESTIMATE_RECEIVE_AMOUNT],
    previewPriceSaga
  );
}
