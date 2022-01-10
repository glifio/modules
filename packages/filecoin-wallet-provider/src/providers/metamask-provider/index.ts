import { FilecoinSnapApi } from '@chainsafe/filsnap-types'
import { CoinType } from '@glif/filecoin-address'
import {
  LotusMessage,
  Message,
  SignedLotusMessage,
} from '@glif/filecoin-message'
import { mapSeries } from 'bluebird'
import signingTools from '@zondax/filecoin-signing-tools/js'
import { WalletType } from '../../types'
import { errors } from '../../errors'
import { WalletSubProvider } from '../../wallet-sub-provider'
import { coinTypeCode, createPath, validIndexes } from '../../utils'

export class MetaMaskProvider implements WalletSubProvider {
  public type: WalletType = 'METAMASK'
  private snap: FilecoinSnapApi
  private accountToPath: Record<string, string> = {}

  constructor({ snap }: { snap: FilecoinSnapApi }) {
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
      const res = await this.snap.signMessage(msg.toZondaxType())
      if (!res) throw new errors.TransactionRejectedError()
      return {
        Message: message,
        Signature: {
          Data: res.signature.data,
          Type: res.signature.type,
        },
      }
    }

    const serializedMessage = signingTools.transactionSerialize(
      msg.toZondaxType(),
    )
    const sig = await this.snap.signMessageRaw(serializedMessage)
    if (!sig) throw new errors.TransactionRejectedError()
    return {
      Message: message,
      Signature: {
        Data: sig,
        Type: 1,
      },
    }
  }
}
