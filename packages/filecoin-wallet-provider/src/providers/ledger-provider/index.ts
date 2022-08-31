import { CoinType } from '@glif/filecoin-address'
import FilecoinApp from '@zondax/ledger-filecoin'
import Transport from '@ledgerhq/hw-transport'
import { mapSeries } from 'bluebird'
import {
  LotusMessage,
  Message,
  SignedLotusMessage
} from '@glif/filecoin-message'
import signingTools from '@zondax/filecoin-signing-tools/js'
import { createPath, coinTypeCode, validIndexes } from '../../utils'
import { SemanticVersion, WalletType } from '../../types'
import { WalletSubProvider } from '../../wallet-sub-provider'
import { CommonLedgerError, errors } from '../../errors'

const {
  LedgerLostConnectionError,
  LedgerDeviceLockedError,
  LedgerFilecoinAppBadVersionError,
  LedgerReplugError,
  LedgerDeviceBusyError,
  WalletProviderError
} = errors

import { badVersion } from './badVersion'
import { AccountStore } from '../../utils/accountStore'

type LedgerResponse = {
  return_code: number
  error_message: string
  device_locked: boolean
}

export type LedgerVersion = LedgerResponse &
  SemanticVersion & {
    test_mode: boolean
    target_id: string
  }

export type LedgerShowAddrAndPubKey = LedgerResponse & {
  addrString: string
}

export type LedgerSignature = LedgerResponse & {
  signature_compact: Buffer
}

export type LedgerSubProvider = WalletSubProvider & {
  getVersion: () => Promise<LedgerVersion>
  showAddressAndPubKey: (_: string) => Promise<LedgerShowAddrAndPubKey>
  resetTransport: (_: Transport) => Promise<void>
  ready: () => Promise<boolean>
}

function handleLedgerResponseErrors(response: LedgerResponse): LedgerResponse {
  if (response.device_locked) {
    throw new LedgerDeviceLockedError()
  }

  if (
    response.error_message &&
    response.error_message.toLowerCase().includes('no errors')
  ) {
    return response
  }
  if (
    response.error_message &&
    response.error_message
      .toLowerCase()
      .includes('transporterror: invalid channel')
  ) {
    throw new LedgerLostConnectionError()
  }

  throw new WalletProviderError({ message: response.error_message })
}

const throwIfBusy = (busy: boolean): void => {
  if (busy) throw new LedgerDeviceBusyError()
}

export class LedgerProvider extends AccountStore implements LedgerSubProvider {
  public type: WalletType = 'LEDGER'
  public ledgerBusy = false
  public minLedgerVersion: SemanticVersion
  private transport: Transport

  constructor({
    transport,
    minLedgerVersion
  }: {
    transport: Transport
    minLedgerVersion: SemanticVersion
  }) {
    super()
    if (!transport)
      throw new errors.InvalidParamsError({
        message: 'Must provide transport when instantiating LedgerSubProvider'
      })
    if (
      !minLedgerVersion ||
      typeof minLedgerVersion.major !== 'number' ||
      typeof minLedgerVersion.minor !== 'number' ||
      typeof minLedgerVersion.patch !== 'number'
    )
      throw new errors.InvalidParamsError({
        message: 'Must provide valid minLedgerVersions'
      })

    this.transport = transport
    this.minLedgerVersion = minLedgerVersion
  }

  /**
   * getVersion call rejects if it takes too long to respond,
   * meaning the Ledger device is locked
   */
  getVersion = (): Promise<LedgerVersion> => {
    throwIfBusy(this.ledgerBusy)
    this.ledgerBusy = true
    return new Promise((resolve, reject) => {
      let finished = false
      setTimeout(() => {
        if (!finished) {
          finished = true
          this.ledgerBusy = false
          return reject(new LedgerDeviceBusyError())
        }
      }, 3000)

      setTimeout(async () => {
        try {
          const vs = handleLedgerResponseErrors(
            (await new FilecoinApp(
              this.transport
            ).getVersion()) as LedgerVersion
          ) as LedgerVersion

          if (badVersion(this.minLedgerVersion, vs))
            throw new LedgerFilecoinAppBadVersionError({
              message: `
              Filecoin App on Ledger device should be version
              ${this.minLedgerVersion.major}.${this.minLedgerVersion.minor}.${this.minLedgerVersion.patch}
            `
            })
          return resolve(vs)
        } catch (err) {
          return reject(err)
        } finally {
          if (!finished) {
            finished = true
            this.ledgerBusy = false
          }
        }
      })
    })
  }

  ready = async (): Promise<boolean> => {
    try {
      // tslint:disable-next-line no-unused-expression
      handleLedgerResponseErrors(await this.getVersion()) as LedgerVersion
    } catch (err) {
      if (err instanceof Error) {
        throw CommonLedgerError(err)
      } else {
        throw new LedgerReplugError()
      }
    }
    return true
  }

  sign = async (
    from: string,
    message: LotusMessage
  ): Promise<SignedLotusMessage> => {
    throwIfBusy(this.ledgerBusy)
    if (from !== message.From)
      throw new errors.InvalidParamsError({ message: 'from address mismatch' })
    this.ledgerBusy = true
    const path = this.getPath(from)
    let msg: Message
    try {
      msg = Message.fromLotusType(message)
    } catch (err) {
      throw new errors.InvalidParamsError(
        err instanceof Error
          ? {
              message: `Invalid message params passed to sign call: ${err.message}`
            }
          : undefined
      )
    } finally {
      this.ledgerBusy = false
    }
    const serializedMessage = signingTools.transactionSerialize(
      msg.toZondaxType()
    )
    try {
      const res = handleLedgerResponseErrors(
        await new FilecoinApp(this.transport).sign(
          path,
          Buffer.from(serializedMessage, 'hex')
        )
      ) as LedgerSignature
      const signedMessage: SignedLotusMessage = {
        Message: message,
        Signature: {
          Data: res.signature_compact.toString('base64'),
          Type: 1
        }
      }
      return signedMessage
    } catch (err) {
      if (err instanceof Error) {
        throw CommonLedgerError(err)
      } else {
        throw new LedgerReplugError()
      }
    } finally {
      this.ledgerBusy = false
    }
  }

  getAccounts = async (nStart = 0, nEnd = 5, coinType = CoinType.MAIN) => {
    throwIfBusy(this.ledgerBusy)
    if (!validIndexes(nStart, nEnd)) {
      throw new errors.InvalidParamsError({
        message: 'invalid account indexes passed to getAccounts'
      })
    }

    if (coinType !== CoinType.MAIN && coinType !== CoinType.TEST) {
      throw new errors.InvalidParamsError({
        message: 'invalid coinType passed to getAccounts'
      })
    }

    this.ledgerBusy = true
    const paths: string[] = []
    for (let i = nStart; i < nEnd; i += 1) {
      paths.push(createPath(coinTypeCode(coinType), i))
    }
    const addresses = await mapSeries(paths, async (path: string) => {
      try {
        const { addrString } = handleLedgerResponseErrors(
          await new FilecoinApp(this.transport).getAddressAndPubKey(path)
        ) as LedgerShowAddrAndPubKey
        this.setAccountPath(addrString, path)
        return addrString
      } catch (err) {
        if (err instanceof Error) {
          throw CommonLedgerError(err)
        } else {
          throw new LedgerReplugError()
        }
      } finally {
        this.ledgerBusy = false
      }
    })
    this.ledgerBusy = false
    return addresses
  }

  showAddressAndPubKey = async (
    path: string
  ): Promise<LedgerShowAddrAndPubKey> => {
    throwIfBusy(this.ledgerBusy)
    this.ledgerBusy = true
    try {
      const res = handleLedgerResponseErrors(
        await new FilecoinApp(this.transport).showAddressAndPubKey(path)
      ) as LedgerShowAddrAndPubKey
      return res
    } catch (err) {
      if (err instanceof Error) {
        throw CommonLedgerError(err)
      } else {
        throw new LedgerReplugError()
      }
    } finally {
      this.ledgerBusy = false
    }
  }

  keyDerive = async (_: string): Promise<string> => {
    throw new Error('Cannot derive key from Ledger provider')
  }

  resetTransport = async (_transport: Transport): Promise<void> => {
    this.transport = _transport
  }
}
