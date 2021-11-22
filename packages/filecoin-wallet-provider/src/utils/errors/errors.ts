export interface WalletProviderErrorInterface extends Partial<Error> {
  message: string
  code?: number
}

export class WalletProviderError extends Error {
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

export class LedgerLostConnectionError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'connection lost',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerLostConnectionError.prototype)
  }
}

export class TransportNotSupportedError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'transport not supported by device',
      ...args,
    })
    Object.setPrototypeOf(this, TransportNotSupportedError.prototype)
  }
}

export class LedgerReplugError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'unknown',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerReplugError.prototype)
  }
}

export class LedgerDisconnectedError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device disconnected',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerDisconnectedError.prototype)
  }
}

export class LedgerInUseByAnotherApp extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device in use by another app',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerInUseByAnotherApp.prototype)
  }
}

export class LedgerNotFoundError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device not found',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerNotFoundError.prototype)
  }
}

export class LedgerDeviceLockedError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'ledger device locked',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerDeviceLockedError.prototype)
  }
}

export class LedgerFilecoinAppBadVersionError extends WalletProviderError {
  constructor({ ...args }: Partial<WalletProviderErrorInterface> = {}) {
    super({
      message: args.message || 'bad filecoin app version on ledger device',
      ...args,
    })
    Object.setPrototypeOf(this, LedgerFilecoinAppBadVersionError.prototype)
  }
}
