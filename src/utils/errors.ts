export class AppError extends Error {
  public readonly code: number;
  public description: string;

  constructor(code: number, description: string) {
    super(`(code: ${code}) ${description}`);
    this.code = code;
    this.description = description;
  }

  toToastMessage(): string {
    return `Error ${this.code}: ${this.description}`
  }

  static fromError(error: Error): AppError {
    return new AppError(-1, error.message);
  }
}

export const MakeTradeError = new AppError(1, 'TradePropose or TradeComplete error');
export const PinDigitsError = new AppError(2, 'PIN must contain 6 digits');
export const InvalidTradeTypeError = new AppError(3, 'Trade type should be BUY or SELL');
export const NoMarketsProvidedError = new AppError(4, '0 markets provided by liquidity daemons');
export const UnableToCopyTxIDError = new AppError(5, 'Unable to copy txID');
export const IncorrectPINError = new AppError(6, 'Incorrect PIN');
export const SecureStorageError = new AppError(7, 'Secure Storage error')
export const PINsDoNotMatchError = new AppError(8, 'PINs needs to be equal')
export const QRCodeScanError = new AppError(9, 'QR Scanner scan failed');