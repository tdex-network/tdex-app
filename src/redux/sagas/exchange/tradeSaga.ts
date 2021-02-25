// import { takeLatest, select, put, call } from 'redux-saga/effects';
// import { TradeType } from 'tdex-sdk';
// import {
//   SET_SEND_ASSET,
//   SET_RECEIVE_ASSET,
//   SWAP_ASSETS,
//   setMarket,
//   setTradeType,
//   setReceiveAsset,
// } from '../../actions/exchange/tradeActions';
// import { findMarketByAssets } from '../../services/exchange/providerService';

// function* setTradeTypeSaga() {
//   const { market, sendAsset } = yield select((state: any) => ({
//     market: state.exchange.trade.market,
//     sendAsset: state.exchange.trade.sendAsset,
//   }));

//   const tradeType =
//     market?.baseAsset == sendAsset ? TradeType.SELL : TradeType.BUY;

//   yield put(setTradeType(tradeType));
// }

// function* setMarketAndTradeTypeSaga() {
//   const { markets, sendAsset, receiveAsset } = yield select((state: any) => ({
//     markets: state.exchange.provider.markets,
//     sendAsset: state.exchange.trade.sendAsset,
//     receiveAsset: state.exchange.trade.receiveAsset,
//   }));

//   const market = yield call(findMarketByAssets, markets, [
//     sendAsset,
//     receiveAsset,
//   ]);

//   yield put(setMarket(market));
//   yield call(setTradeTypeSaga);
// }

// function* swapAssetsSaga() {
//   yield call(setTradeTypeSaga);
// }

// function* selectCounterAssetSaga() {
//   const { markets, sendAsset, receiveAsset } = yield select((state: any) => ({
//     markets: state.exchange.provider.markets,
//     sendAsset: state.exchange.trade.sendAsset,
//     receiveAsset: state.exchange.trade.receiveAsset,
//   }));

//   if (!findMarketByAssets(markets, [sendAsset, receiveAsset])) {
//     const market = yield call(findMarketByAssets, markets, [sendAsset]);
//     const counterAsset =
//       sendAsset == market.baseAsset ? market.quoteAsset : market.baseAsset;

//     yield put(setReceiveAsset(counterAsset));
//   }
// }

export function* tradeWatcherSaga() {
  // yield takeLatest(SWAP_ASSETS, swapAssetsSaga);
  // yield takeLatest(
  //   [SET_SEND_ASSET, SET_RECEIVE_ASSET],
  //   setMarketAndTradeTypeSaga
  // );
  // yield takeLatest(SET_SEND_ASSET, selectCounterAssetSaga);
}
