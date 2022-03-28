import { FilecoinSnapApi } from '@chainsafe/filsnap-types'
import { CoinType } from '@glif/filecoin-address'
import {
  LotusMessage,
  Message,
  SignedLotusMessage,
  ZondaxMessage,
} from '@glif/filecoin-message'
import { mapSeries } from 'bluebird'
import { WalletType } from '../../types'
import { errors } from '../../errors'
import { WalletSubProvider } from '../../wallet-sub-provider'
import {
  coinTypeCode,
  createPath,
  validIndexes,
  extractCoinTypeFromPath,
} from '../../utils'

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
          await this.snap.configure({ derivationPath: path, network: coinType })
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
      await this.snap.configure({
        derivationPath: path,
        network: extractCoinTypeFromPath(path),
      })
    } catch (err) {
      throw new errors.MetaMaskError({
        message: err instanceof Error ? err.message : 'Error configuring snap',
      })
    }

    let msg: Message
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

    const signReq = await this.snap.signMessage(
      msg.toZondaxType() as ZondaxMessage & { params: string },
    )

    if (!signReq)
      throw new errors.MetaMaskError({ message: 'Error signing transaction' })
    if (!signReq.confirmed) throw new errors.TransactionRejectedError()
    if (signReq.error)
      throw new errors.MetaMaskError({
        message: signReq.error.message,
      })

    return {
      Message: message,
      Signature: {
        Data: signReq.signedMessage?.signature?.data,
        Type: signReq.signedMessage?.signature?.type,
      },
    }
  }
}
