import errors from './errors'

const {
  LedgerInUseByAnotherApp,
  LedgerReplugError,
  LedgerNotFoundError,
  LedgerFilecoinAppNotOpenError,
} = errors

export const handleCommonLedgerErrors = (error: Error) => {
  console.log('error', error)
  if (
    error.message.toLowerCase().includes('unable to claim interface.') ||
    error.message.toLowerCase().includes('failed to open the device')
  ) {
    throw new LedgerInUseByAnotherApp(error)
  } else if (
    error.message.toLowerCase().includes('transporterror: invalid channel') ||
    error.message.toLocaleLowerCase().includes('device is already open.')
  ) {
    throw new LedgerReplugError(error)
  } else if (
    error.message.toLowerCase().includes('no device selected') ||
    error.message.toLowerCase().includes('access denied to use ledger device')
  ) {
    throw new LedgerNotFoundError(error)
  } else if (
    error.message.toLowerCase().includes('28161') ||
    error.message.toLowerCase().includes('app does not seem to be open')
  )
    throw new LedgerFilecoinAppNotOpenError()
}
