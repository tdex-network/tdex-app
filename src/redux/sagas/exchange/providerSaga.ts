import { takeLatest, select, put, call, retry } from 'redux-saga/effects';
import { ActionType } from '../../../utils/types';
import { TradeType } from 'tdex-sdk';
import {
  SET_PROVIDER_ENDPOINT,
  ESTIMATE_PRICE,
  EXECUTE_TRADE,
  setProviderMarkets,
  setProviderAssetIds,
} from '../../actions/exchange/providerActions';
import {
  setSendAsset,
  setReceiveAsset,
  setSendAmount,
  setReceiveAmount,
  completeTrade,
} from '../../actions/exchange/tradeActions';
import { setAssets } from '../../actions/assetsActions';
import { prepareIdentityOpts } from '../../services/walletService';
import {
  fetchMarkets,
  estimatePrice,
  executeTrade,
} from '../../services/exchange/providerService';
import { fetchAssets } from '../../services/assetsService';
import { marketsToAssetIds } from '../../transformers/providerTransformers';
import { fromSatoshi } from '../../../utils/helpers';

function* initExchangeSaga() {
  try {
    const endpoint = yield select((state) => state.exchange.provider.endpoint);
    const markets = yield retry(3, 0, fetchMarkets, endpoint);
    const assetIds = yield call(marketsToAssetIds, markets);

    yield put(setProviderMarkets(markets));
    yield put(setProviderAssetIds(assetIds));

    if (Object.keys(markets).length) {
      const assets = yield call(fetchAssets, assetIds);
      yield put(setAssets(assets));

      const firstMarket = markets[0];
      yield put(setSendAsset(firstMarket.baseAsset));
      yield put(setReceiveAsset(firstMarket.quoteAsset));
    }
  } catch (error) {
    console.log(error);
  }
}

function* estimatePriceSaga({ payload }: ActionType) {
  try {
    const {
      mnemonic,
      addresses,
      endpoint,
      market,
      sendAsset,
      receiveAsset,
      sendAmount,
      receiveAmount,
      tradeType,
    } = yield select((state: any) => ({
      mnemonic: state.wallet.mnemonic,
      addresses: state.wallet.addresses,
      endpoint: state.exchange.provider.endpoint,
      market: state.exchange.trade.market,
      sendAsset: state.exchange.trade.sendAsset,
      sendAmount: state.exchange.trade.sendAmount,
      receiveAsset: state.exchange.trade.receiveAsset,
      receiveAmount: state.exchange.trade.receiveAmount,
      tradeType: state.exchange.trade.tradeType,
    }));

    const identityOpts = yield call(prepareIdentityOpts, mnemonic, addresses);

    const { amount, asset, setAmountAction } =
      payload == 'send'
        ? {
            amount: receiveAmount,
            asset: receiveAsset,
            setAmountAction: setSendAmount,
          }
        : {
            amount: sendAmount,
            asset: sendAsset,
            setAmountAction: setReceiveAmount,
          };

    let estimatedAmount;

    try {
      const preview = yield retry(3, 0, estimatePrice, {
        endpoint,
        market,
        amount,
        asset,
        tradeType,
        identityOpts,
      });

      estimatedAmount = fromSatoshi(
        payload == 'send' ? preview.amountToBeSent : preview.amountToReceive
      );
    } catch (error) {
      estimatedAmount = 0;
    }

    yield put(setAmountAction(estimatedAmount));
  } catch (error) {
    console.log(error);
  }
}

function* executeTradeSaga() {
  const {
    mnemonic,
    addresses,
    endpoint,
    market,
    sendAmount,
    receiveAmount,
    sendAsset,
    receiveAsset,
    tradeType,
    assets,
    blindingPrivateKey,
  } = yield select((state: any) => ({
    mnemonic: state.wallet.mnemonic,
    addresses: state.wallet.addresses,
    endpoint: state.exchange.provider.endpoint,
    market: state.exchange.trade.market,
    sendAmount: state.exchange.trade.sendAmount,
    receiveAmount: state.exchange.trade.receiveAmount,
    sendAsset: state.exchange.trade.sendAsset,
    receiveAsset: state.exchange.trade.receiveAsset,
    tradeType: state.exchange.trade.tradeType,
    assets: state.assets,
    blindingPrivateKey: state.wallet.address.blindingPrivateKey,
  }));

  const identityOpts = yield call(prepareIdentityOpts, mnemonic, addresses);
  const amount = tradeType == TradeType.SELL ? sendAmount : receiveAmount;
  const asset = market.baseAsset;

  try {
    const txid = yield call(executeTrade, {
      endpoint,
      market,
      amount,
      asset,
      tradeType,
      identityOpts,
    });

    const sendTicker = assets.byId[sendAsset].ticker;
    const receiveTicker = assets.byId[receiveAsset].ticker;

    const transaction = {
      txid,
      address: blindingPrivateKey,
      status: 'complete',
      sentAmount: sendAmount,
      sentAsset: {
        id: sendAsset,
        ticker: sendTicker,
      },
      receivedAmount: receiveAmount,
      receivedAsset: {
        id: receiveAsset,
        ticker: receiveTicker,
      },
      fee: {
        amount: 0.25,
      },
      createdAt: new Date(),
    };

    yield put(completeTrade(transaction));
  } catch (error) {
    console.log(error);
  }
}

export function* providerWatcherSaga() {
  yield takeLatest(SET_PROVIDER_ENDPOINT, initExchangeSaga);
  yield takeLatest(ESTIMATE_PRICE, estimatePriceSaga);
  yield takeLatest(EXECUTE_TRADE, executeTradeSaga);
}
