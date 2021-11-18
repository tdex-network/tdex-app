import type { StrictEffect } from 'redux-saga/effects';

export type SagaGenerator<ReturnType = void, YieldType = void> = Generator<StrictEffect, ReturnType, YieldType>;
