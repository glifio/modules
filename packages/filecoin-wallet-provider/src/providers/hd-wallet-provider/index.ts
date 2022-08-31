import { CoinType } from '@glif/filecoin-address'
import {
  Message,
  SignedLotusMessage,
  LotusMessage
} from '@glif/filecoin-message'
import signingTools from '@zondax/filecoin-signing-tools/js'
import { WalletType } from '../../types'
import { WalletSubProvider } from '../../wallet-sub-provider'
import { createPath, coinTypeCode, validIndexes } from '../../utils'
import { errors } from '../../errors'
import { AccountStore } from '../../utils/accountStore'

const { InvalidParamsError } = errors

export class HDWalletProvider
  extends AccountStore
  implements WalletSubProvider
{
  public type: WalletType = 'HD_WALLET'
  #seed: string
  constructor(seed: string) {
    super()
    if (!seed) throw new InvalidParamsError()
    this.#seed = seed
  }

  getAccounts = async (
    nStart = 0,
    nEnd = 5,
    coinType = CoinType.MAIN
  ): Promise<string[]> => {
    if (!validIndexes(nStart, nEnd)) {
      throw new InvalidParamsError({
        message: 'Invalid indexes provided to getAccounts'
      })
    }

    if (coinType !== CoinType.MAIN && coinType !== CoinType.TEST) {
      throw new InvalidParamsError({
        message: 'Invalid coinType passed to getAccounts'
      })
    }

    const accounts = []
    for (let i = nStart; i < nEnd; i += 1) {
      const path = createPath(coinTypeCode(coinType), i)
      const account = signingTools.keyDerive(this.#seed, path, '').address
      accounts.push(account)
      this.setAccountPath(account, path)
    }
    return accounts
  }

  keyDerive = async (path: string): Promise<string> => {
    return signingTools.keyDerive(this.#seed, path, '').private_base64
  }

  sign = async (
    from: string,
    message: LotusMessage
  ): Promise<SignedLotusMessage> => {
    if (from !== message.From) {
      throw new InvalidParamsError({ message: 'From address mismatch' })
    }
    const path = this.getPath(from)
    let msg
    try {
      msg = Message.fromLotusType(message)
    } catch (err) {
      throw new InvalidParamsError(
        err instanceof Error
          ? {
              message: `Invalid message params passed to sign call: ${err.message}`
            }
          : undefined
      )
    }

    const { private_hexstring } = signingTools.keyDerive(this.#seed, path, '')
    const { signature } = signingTools.transactionSign(
      msg.toZondaxType(),
      Buffer.from(private_hexstring, 'hex').toString('base64')
    ) as { signature: { data: string; type: number } }

    return {
      Message: message,
      Signature: {
        Type: signature.type,
        Data: signature.data
      }
    }
  }
}
