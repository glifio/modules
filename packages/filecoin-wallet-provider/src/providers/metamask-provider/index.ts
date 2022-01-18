import { FilecoinSnapApi } from '@chainsafe/filsnap-types'
import { CoinType } from '@glif/filecoin-address'
import {
  LotusMessage,
  Message,
  SignedLotusMessage,
} from '@glif/filecoin-message'
import { mapSeries } from 'bluebird'
import signingTools, { SignedMessage } from '@zondax/filecoin-signing-tools/js'
import { WalletType } from '../../types'
import { errors } from '../../errors'
import { WalletSubProvider } from '../../wallet-sub-provider'
import { coinTypeCode, createPath, validIndexes } from '../../utils'

const handleSignature = <T>(signMessageResponse?: {
  sig: T
  confirmed: boolean
  error: Error
}): T => {
  if (!signMessageResponse)
    throw new errors.MetaMaskError({ message: 'Error signing transaction' })
  if (!signMessageResponse.confirmed)
    throw new errors.TransactionRejectedError()
  if (signMessageResponse.error)
    throw new errors.MetaMaskError({
      message: signMessageResponse.error.message,
    })

  return signMessageResponse.sig
}

export class MetaMaskProvider implements WalletSubProvider {
  public type: WalletType = 'METAMASK'
  private snap: FilecoinSnapApi
  private accountToPath: Record<string, string> = {}

  constructor({ snap }: { snap: FilecoinSnapApi }) {
    if (!snap)
      throw new errors.InvalidParamsError({
        message: 'Must pass `snap` to MetaMask provider',
      })
    this.snap = snap
  }

  getAccounts = async (nStart = 0, nEnd = 5, coinType = CoinType.MAIN) => {
    if (!validIndexes(nStart, nEnd)) {
      throw new errors.InvalidParamsError({
        message: 'invalid account indexes passed to getAccounts',
      })
    }

    if (coinType !== CoinType.MAIN && coinType !== CoinType.TEST) {
      throw new errors.InvalidParamsError({
        message: 'invalid coinType passed to getAccounts',
      })
    }
    try {
      const paths: string[] = []
      for (let i = nStart; i < nEnd; i += 1) {
        paths.push(createPath(coinTypeCode(coinType), i))
      }
      const addresses = await mapSeries(paths, async (path: string) => {
        try {
          await this.snap.configure({ derivationPath: path })
          const account = await this.snap.getAddress()
          this.accountToPath[account] = path
          return account
        } catch (err) {
          throw new errors.MetaMaskError({
            message:
              err instanceof Error
                ? err.message
                : 'Error getting accounts from MetaMask',
          })
        }
      })
      return addresses
    } catch (err) {
      throw new errors.MetaMaskError({
        message:
          err instanceof Error
            ? err.message
            : 'Error getting accounts from MetaMask',
      })
    }
  }

  sign = async (
    from: string,
    message: LotusMessage,
  ): Promise<SignedLotusMessage> => {
    if (from !== message.From) {
      throw new errors.InvalidParamsError({ message: 'From address mismatch' })
    }
    const path = this.accountToPath[from]
    if (!path) {
      throw new errors.WalletProviderError({
        message:
          'Must call getAccounts with to derive this from address before signing with it',
      })
    }

    try {
      await this.snap.configure({ derivationPath: path })
    } catch (err) {
      throw new errors.MetaMaskError({
        message: err instanceof Error ? err.message : 'Error configuring snap',
      })
    }

    let msg
    try {
      msg = Message.fromLotusType(message)
    } catch (err) {
      throw new errors.InvalidParamsError(
        err instanceof Error
          ? {
              message: `Invalid message params passed to sign call: ${err.message}`,
            }
          : undefined,
      )
    }

    let hasParams = false
    if (message.Params) {
      if (Array.isArray(message.Params)) hasParams = message.Params.length > 0
      else hasParams = true
    }

    // use transactionSign instead of transactionSignRaw to show in the MetaMask UI
    if (message.Method === 0 && !hasParams) {
      const signReq = await this.snap.signMessage(msg.toZondaxType())
      const { signature } = handleSignature<SignedMessage>({
        confirmed: signReq.confirmed,
        error: signReq.error,
        sig: signReq.signedMessage,
      })

      return {
        Message: message,
        Signature: {
          Data: signature.data,
          Type: signature.type,
        },
      }
    }

    const serializedMessage = signingTools.transactionSerialize(
      msg.toZondaxType(),
    )
    const signRawReq = await this.snap.signMessageRaw(serializedMessage)

    const base64Sig = handleSignature<string>({
      confirmed: signRawReq.confirmed,
      error: signRawReq.error,
      sig: signRawReq.signature,
    })

    return {
      Message: message,
      Signature: {
        Data: base64Sig,
        Type: 1,
      },
    }
  }
}
