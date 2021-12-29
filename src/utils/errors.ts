export class AppError extends Error {
  public readonly code: number;
  public description: string;

  constructor(code: number, description: string) {
    super(`(code: ${code}) ${description}`);
    this.code = code;
    this.description = description;
  }

  toToastMessage(): string {
    return `Error ${this.code}: ${this.description}`;
  }

  static fromError(error: Error): AppError {
    return new AppError(-1, error.message);
  }
}

export const MakeTradeError = new AppError(1, 'TradePropose or TradeComplete error');
export const PinDigitsError = new AppError(2, 'PIN must contain 6 digits');
export const InvalidTradeTypeError = new AppError(3, 'Trade type should be BUY or SELL');
export const NoMarketsProvidedError = new AppError(4, '0 markets provided by liquidity daemons');
export const IncorrectPINError = new AppError(6, 'Incorrect PIN');
export const SecureStorageError = new AppError(7, 'Secure Storage error');
export const PINsDoNotMatchError = new AppError(8, 'PINs needs to be equal');
export const QRCodeScanError = new AppError(9, 'QR Scanner scan failed');
export const AddressGenerationError = new AppError(10, 'Unable to generate new address');
export const InvalidMnemonicError = new AppError(11, 'Invalid mnemonic error');
export const WithdrawTxError = new AppError(12, 'An error occurred while sending withdraw transaction');
export const TDEXRegistryError = new AppError(13, 'Unable to fetch providers from registry');
export const UpdateTransactionsError = new AppError(14, 'Tx update error occurs');
export const UpdateUtxosError = new AppError(15, 'Utxo update error occurs');
export const DeepRestorationError = new AppError(16, 'Account discovery has failed');

// Pegin
export const ClaimPeginError = new AppError(17, 'Claim pegin bitcoin has failed');
export const NoClaimFoundError = new AppError(18, 'No claims have been found');
export const PeginRestorationError = new AppError(19, 'Pegin restoration has failed');
//
export const InvalidBitcoinAddress = new AppError(20, 'Invalid Bitcoin address');
export const FailedToRestoreProvidersError = new AppError(21, 'Failed to restore providers');
export const IsAlreadyFetchingUtxosError = new AppError(22, 'App is busy. Please try in a moment');
export const InvalidUrl = new AppError(23, 'Invalid URL');
