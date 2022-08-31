import Transport from '@ledgerhq/hw-transport'
import TransportWebHID from '@ledgerhq/hw-transport-webhid'

import { errors, CommonLedgerError } from '../errors'

const {
  TransportNotSupportedError,
  LedgerReplugError,
  LedgerDisconnectedError
} = errors

type TransportType = 'WEB_HID' | 'WEB_USB'

export default class WebHIDTransportWrapper {
  type: TransportType = 'WEB_HID'
  initted = false

  private _transport: Transport | null = null

  get transport(): Transport {
    if (!this._transport) throw new LedgerDisconnectedError()
    return this._transport
  }

  checkSupport = async (): Promise<void> => {
    const isSupported = await TransportWebHID.isSupported()
    if (!isSupported) throw new TransportNotSupportedError()
  }

  disconnect = async (): Promise<void> => {
    try {
      if (this._transport) await this._transport.close()
    } catch {
      throw new LedgerReplugError({ message: 'Error closing transport.' })
    }
  }

  connect = async (): Promise<void> => {
    if (!this.initted) {
      await this.checkSupport()
      this.initted = true
    }

    await this.disconnect()

    try {
      this._transport = await TransportWebHID.create()
    } catch (err) {
      if (err instanceof Error) {
        throw CommonLedgerError(err)
      } else {
        throw new LedgerReplugError()
      }
    }
  }
}
