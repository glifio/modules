import {
  LedgerInUseByAnotherApp,
  LedgerReplugError,
  LedgerNotFoundError,
} from './errors'

export const handleCommonLedgerErrors = (error: Error) => {
  if (
    error.message.toLowerCase().includes('unable to claim interface.') ||
    error.message.toLowerCase().includes('failed to open the device')
  ) {
    throw new LedgerInUseByAnotherApp(error)
  } else if (
    error.message.toLowerCase().includes('transporterror: invalid channel')
  ) {
    throw new LedgerReplugError(error)
  } else if (
    error.message.toLowerCase().includes('no device selected') ||
    error.message.toLowerCase().includes('access denied to use ledger device')
  ) {
    throw new LedgerNotFoundError(error)
  }
}
