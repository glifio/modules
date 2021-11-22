import { CoinType } from '@glif/filecoin-address'
import FilecoinApp from '@zondax/ledger-filecoin'
import Transport from '@ledgerhq/hw-transport'
import { mapSeries } from 'bluebird'
import {
  LotusMessage,
  Message,
  SignedLotusMessage,
} from '@glif/filecoin-message'
import signingTools from '@zondax/filecoin-signing-tools/js'
import createPath, { coinTypeCode } from '../../utils/createPath'
import { SemanticVersion, WalletType } from '../../types'
import { WalletSubProvider } from '../../wallet-sub-provider'
import { handleCommonLedgerErrors, errors } from '../../errors'

const {
  LedgerLostConnectionError,
  LedgerDeviceLockedError,
  LedgerFilecoinAppBadVersionError,
  LedgerReplugError,
} = errors

import { badVersion } from './badVersion'

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

function handleErrors(response: LedgerResponse): LedgerResponse {
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
  throw new Error(response.error_message)
}

const throwIfBusy = (busy: boolean): void => {
  if (busy)
    throw new Error(
      'Ledger is busy, please check device, or quit Filecoin app and unplug/replug your device.',
    )
}

export class LedgerProvider implements LedgerSubProvider {
  public type: WalletType = 'LEDGER'
  public ledgerBusy: boolean = false
  public minLedgerVersion: SemanticVersion
  private transport: Transport
  private accountToPath: Record<string, string> = {}

  constructor({
    transport,
    minLedgerVersion,
  }: {
    transport: Transport
    minLedgerVersion: SemanticVersion
  }) {
    if (!transport)
      throw new Error(
        'Must provide transport when instantiating LedgerSubProvider',
      )
    if (
      typeof minLedgerVersion.major !== 'number' ||
      typeof minLedgerVersion.minor !== 'number' ||
      typeof minLedgerVersion.patch !== 'number'
    )
      throw new Error('Must provide valid minLedgerVersions')

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
          return reject(new Error('Ledger device locked or busy'))
        }
      }, 3000)

      setTimeout(async () => {
        try {
          const response = handleErrors(
            (await new FilecoinApp(
              this.transport,
            ).getVersion()) as LedgerVersion,
          ) as LedgerVersion
          return resolve(response)
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
      const v = await this.getVersion()
      if (v.device_locked) throw new LedgerDeviceLockedError()
      if (badVersion(this.minLedgerVersion, v))
        throw new LedgerFilecoinAppBadVersionError({
          message: `
              Filecoin App on Ledger device should be version
              ${this.minLedgerVersion.major}.${this.minLedgerVersion.minor}.${this.minLedgerVersion.patch}
            `,
        })
    } catch (err) {
      if (err instanceof Error) {
        handleCommonLedgerErrors(err)
      } else {
        throw new LedgerReplugError()
      }
    }
    return true
  }

  sign = async (
    from: string,
    message: LotusMessage,
  ): Promise<SignedLotusMessage> => {
    throwIfBusy(this.ledgerBusy)
    if (from !== message.From) throw new Error('From address mismatch')
    this.ledgerBusy = true
    const path = this.accountToPath[from]
    const msg = Message.fromLotusType(message)
    const serializedMessage = signingTools.transactionSerialize(
      msg.toZondaxType(),
    )
    const res = handleErrors(
      await new FilecoinApp(this.transport).sign(
        path,
        Buffer.from(serializedMessage, 'hex'),
      ),
    ) as LedgerSignature
    this.ledgerBusy = false
    const signedMessage: SignedLotusMessage = {
      Message: message,
      Signature: {
        Data: res.signature_compact.toString('base64'),
        Type: 1,
      },
    }
    return signedMessage
  }

  getAccounts = async (nStart = 0, nEnd = 5, coinType = CoinType.MAIN) => {
    throwIfBusy(this.ledgerBusy)
    this.ledgerBusy = true
    const paths: string[] = []
    for (let i = nStart; i < nEnd; i += 1) {
      paths.push(createPath(coinTypeCode(coinType), i))
    }
    const addresses = await mapSeries(paths, async (path: string) => {
      const { addrString } = handleErrors(
        await new FilecoinApp(this.transport).getAddressAndPubKey(path),
      ) as LedgerShowAddrAndPubKey
      this.accountToPath[addrString] = path
      return addrString
    })
    this.ledgerBusy = false
    return addresses
  }

  showAddressAndPubKey = async (
    path: string,
  ): Promise<LedgerShowAddrAndPubKey> => {
    throwIfBusy(this.ledgerBusy)
    this.ledgerBusy = true
    const res = handleErrors(
      await new FilecoinApp(this.transport).showAddressAndPubKey(path),
    ) as LedgerShowAddrAndPubKey
    this.ledgerBusy = false
    return res
  }

  resetTransport = async (_transport: Transport): Promise<void> => {
    this.transport = _transport
  }
}
