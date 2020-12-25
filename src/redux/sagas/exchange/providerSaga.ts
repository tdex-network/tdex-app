import { takeLatest, call, put, select } from 'redux-saga/effects';
import { TradeType } from 'tdex-sdk';
import {
  EXECUTE_TRADE,
  SET_PROVIDER_ENDPOINT,
  setProviderMarkets,
  setProviderAssets,
} from '../../actions/exchange/providerActions';
import {
  setSendAsset,
  setReceiveAsset,
  completeTrade,
} from '../../../redux/actions/exchange/tradeActions';
import {
  getIdentityOpts,
  getCachedAddresses,
} from '../../services/walletService';
import {
  fetchMarkets,
  fetchAssets,
  executeTrade,
} from '../../services/exchange/providerService';
import { marketsToAssetIds } from '../../transformers/providerTransformers';

function* initExchangeSaga() {
  try {
    const endpoint = yield select(
      (state: any) => state.exchange.provider.endpoint
    );

    const markets = yield call(fetchMarkets, endpoint);
    const firstMarket = markets[0];
    const assets = yield call(fetchAssets, marketsToAssetIds(markets));

    yield put(setProviderMarkets(markets));
    yield put(setProviderAssets(assets));

    if (markets) {
      yield put(setSendAsset(firstMarket?.baseAsset));
      yield put(setReceiveAsset(firstMarket?.quoteAsset));
    }
  } catch (error) {
    console.log(error);
  }
}

function* executeTradeSaga() {
  const {
    mnemonic,
    endpoint,
    market,
    sendAmount,
    receiveAmount,
    sendAsset,
    receiveAsset,
    tradeType,
    providerAssets,
    blindingPrivateKey,
  } = yield select((state: any) => ({
    mnemonic: state.wallet.mnemonic,
    endpoint: state.exchange.provider.endpoint,
    market: state.exchange.trade.market,
    sendAmount: state.exchange.trade.sendAmount,
    receiveAmount: state.exchange.trade.receiveAmount,
    sendAsset: state.exchange.trade.sendAsset,
    receiveAsset: state.exchange.trade.receiveAsset,
    tradeType: state.exchange.trade.tradeType,
    providerAssets: state.exchange.provider.assets,
    blindingPrivateKey: state.wallet.address.blindingPrivateKey,
  }));

  const addresses = yield call(getCachedAddresses);
  const identityOpts = yield call(getIdentityOpts, mnemonic, addresses);
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

    const sendTicker = providerAssets.find((x: any) => x.id == sendAsset)
      .ticker;

    const receiveTicker = providerAssets.find((x: any) => x.id == receiveAsset)
      .ticker;

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
  yield takeLatest(EXECUTE_TRADE, executeTradeSaga);
}
