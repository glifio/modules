import errors from './errors'

const {
  LedgerInUseByAnotherApp,
  LedgerReplugError,
  LedgerNotFoundError,
  LedgerFilecoinAppNotOpenError,
  TransactionRejectedError,
  WalletProviderError,
} = errors

export const CommonLedgerError = (error: Error): Error => {
  if (
    error.message.toLowerCase().includes('unable to claim interface.') ||
    error.message.toLowerCase().includes('failed to open the device')
  ) {
    return new LedgerInUseByAnotherApp(error)
  } else if (
    error.message.toLowerCase().includes('transporterror: invalid channel') ||
    error.message.toLocaleLowerCase().includes('device is already open.')
  ) {
    return new LedgerReplugError(error)
  } else if (
    error.message.toLowerCase().includes('no device selected') ||
    error.message.toLowerCase().includes('access denied to use ledger device')
  ) {
    return new LedgerNotFoundError(error)
  } else if (
    error.message.toLowerCase().includes('28161') ||
    error.message.toLowerCase().includes('app does not seem to be open')
  ) {
    return new LedgerFilecoinAppNotOpenError()
  } else if (error.message.toLowerCase().includes('transaction rejected')) {
    return new TransactionRejectedError()
  } else if (error instanceof WalletProviderError) {
    return error
  } else {
    return new LedgerReplugError(error)
  }
}
