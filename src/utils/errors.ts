/* eslint-disable import/no-mutable-exports */
import i18n from 'i18next';

export class AppError extends Error {
  public readonly code: number;
  public description: string;

  constructor(code: number, description: string) {
    super(`(code: ${code}) ${description}`);
    this.code = code;
    this.description = description;
  }

  static fromError(error: Error): AppError {
    return new AppError(-1, error.message);
  }

  toToastMessage(): string {
    return `Error ${this.code}: ${this.description}`;
  }
}

export let MakeTradeError: AppError;
export let PinDigitsError: AppError;
export let InvalidTradeTypeError: AppError;
export let NoMarketsAvailableForAllPairsError: AppError;
export let NoMarketsAvailableForSelectedPairError: AppError;
export let IncorrectPINError: AppError;
export let SecureStorageError: AppError;
export let PINsDoNotMatchError: AppError;
export let QRCodeScanError: AppError;
export let AddressGenerationError: AppError;
export let InvalidMnemonicError: AppError;
export let WithdrawTxError: AppError;
export let TDEXRegistryError: AppError;
export let UpdateTransactionsError: AppError;
export let UpdateUtxosError: AppError;
export let DeepRestorationError: AppError;
export let ClaimPeginError: AppError;
export let NoClaimFoundError: AppError;
export let PeginRestorationError: AppError;
export let InvalidBitcoinAddress: AppError;
export let FailedToRestoreProvidersError: AppError;
export let AppIsBusy: AppError;
export let InvalidUrl: AppError;
export let NoOtherProvider: AppError;

if (i18n.isInitialized) {
  MakeTradeError = new AppError(1, i18n.t('MakeTradeError'));
  PinDigitsError = new AppError(2, i18n.t('PinDigitsError'));
  InvalidTradeTypeError = new AppError(3, i18n.t('InvalidTradeTypeError'));
  NoMarketsAvailableForAllPairsError = new AppError(4, i18n.t('NoMarketsAvailableForAllPairsError'));
  NoMarketsAvailableForSelectedPairError = new AppError(5, i18n.t('NoMarketsAvailableForSelectedPairError'));
  IncorrectPINError = new AppError(6, i18n.t('IncorrectPINError'));
  SecureStorageError = new AppError(7, i18n.t('SecureStorageError'));
  PINsDoNotMatchError = new AppError(8, i18n.t('PINsDoNotMatchError'));
  QRCodeScanError = new AppError(9, i18n.t('QRCodeScanError'));
  AddressGenerationError = new AppError(10, i18n.t('AddressGenerationError'));
  InvalidMnemonicError = new AppError(11, i18n.t('InvalidMnemonicError'));
  WithdrawTxError = new AppError(12, i18n.t('WithdrawTxError'));
  TDEXRegistryError = new AppError(13, i18n.t('TDEXRegistryError'));
  UpdateTransactionsError = new AppError(14, i18n.t('UpdateTransactionsError'));
  UpdateUtxosError = new AppError(15, i18n.t('UpdateUtxosError'));
  DeepRestorationError = new AppError(16, i18n.t('DeepRestorationError'));

  // Pegin
  ClaimPeginError = new AppError(17, i18n.t('ClaimPeginError'));
  NoClaimFoundError = new AppError(18, i18n.t('NoClaimFoundError'));
  PeginRestorationError = new AppError(19, i18n.t('PeginRestorationError'));
  //
  InvalidBitcoinAddress = new AppError(20, i18n.t('InvalidBitcoinAddress'));
  FailedToRestoreProvidersError = new AppError(21, i18n.t('FailedToRestoreProvidersError'));
  AppIsBusy = new AppError(22, i18n.t('AppIsBusy'));
  InvalidUrl = new AppError(23, i18n.t('InvalidUrl'));
  // When all providers are excluded except one
  NoOtherProvider = new AppError(24, i18n.t('NoOtherProvider'));
}
