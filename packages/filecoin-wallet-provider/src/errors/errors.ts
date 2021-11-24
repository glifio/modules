/* tslint:disable max-classes-per-file */
interface WalletProviderErrorInterface extends Partial<Error> {
  message: string
  code?: number
}

class WalletProviderError extends Error {
  public code?: number
  constructor(args: WalletProviderErrorInterface) {
    super(args.message)
    Object.setPrototypeOf(this, WalletProviderError.prototype)
    if (args.code) this.code = args.code
  }

  toJSON(): WalletProviderErrorInterface {
    const res: WalletProviderErrorInterface = { message: this.message }
    if (this.code) res.code = this.code
    return res
  }
}

class LedgerLostConnectionError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'connection lost',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerLostConnectionError.prototype)
  }
}

class TransportNotSupportedError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'transport not supported by device',
      ...args,
    })
    Object.setPrototypeOf(this, TransportNotSupportedError.prototype)
  }
}

class LedgerReplugError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'unknown',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerReplugError.prototype)
  }
}

class LedgerDisconnectedError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device disconnected',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerDisconnectedError.prototype)
  }
}

class LedgerInUseByAnotherApp extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device in use by another app',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerInUseByAnotherApp.prototype)
  }
}

class LedgerNotFoundError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device not found',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerNotFoundError.prototype)
  }
}

class LedgerDeviceLockedError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device locked',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerDeviceLockedError.prototype)
  }
}

class LedgerFilecoinAppBadVersionError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'bad filecoin app version on ledger device',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerFilecoinAppBadVersionError.prototype)
  }
}

class LedgerFilecoinAppNotOpenError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'filecoin app not open on device',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerFilecoinAppNotOpenError.prototype)
  }
}

class LedgerDeviceBusyError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device locked or busy',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerDeviceBusyError.prototype)
  }
}

class InvalidParamsError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'invalid params',
      ...args,
    })
    Object.setPrototypeOf(this, InvalidParamsError.prototype)
  }
}

class UnsupportedKeyTypeError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'unsupported key type',
      ...args,
    })
    Object.setPrototypeOf(this, UnsupportedKeyTypeError.prototype)
  }
}

export default {
  InvalidParamsError,
  LedgerLostConnectionError,
  LedgerReplugError,
  LedgerDisconnectedError,
  LedgerInUseByAnotherApp,
  LedgerNotFoundError,
  LedgerDeviceLockedError,
  LedgerFilecoinAppBadVersionError,
  LedgerFilecoinAppNotOpenError,
  LedgerDeviceBusyError,
  TransportNotSupportedError,
  UnsupportedKeyTypeError,
  WalletProviderError,
}
