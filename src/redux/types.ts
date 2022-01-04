import type { StrictEffect } from 'redux-saga/effects';

import type { store } from './store';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type SagaGenerator<ReturnType = void, YieldType = void> = Generator<StrictEffect, ReturnType, YieldType>;
