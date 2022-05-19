import {
  LotusMessage,
  SignedLotusMessage,
  Message,
} from '@glif/filecoin-message'
import { CoinType } from '@glif/filecoin-address'
import signingTools from '@zondax/filecoin-signing-tools/js'
import { WalletSubProvider } from '../../wallet-sub-provider'
import { errors } from '../../errors'

export class SECP256K1KeyProvider implements WalletSubProvider {
  #privateKey: string
  public mainAddress: string

  readonly type = 'SINGLE_KEY_SECP256K1'

  constructor(privateKey: string) {
    if (!privateKey) {
      throw new errors.InvalidParamsError({
        message: 'Must pass private key string to single key provider instance',
      })
    }
    this.#privateKey = privateKey
    try {
      this.mainAddress = signingTools.keyRecover(privateKey, false).address
    } catch (err) {
      throw new errors.InvalidParamsError({
        message: `Invalid private key: ${
          (err as Error)?.message || JSON.stringify(err)
        }`,
      })
    }
    this.mainAddress = signingTools.keyRecover(privateKey, false).address
  }

  async getAccounts(
    _: number,
    __: number,
    coinType: CoinType = CoinType.MAIN,
  ): Promise<string[]> {
    if (coinType === CoinType.TEST) {
      return [`t${this.mainAddress.slice(1)}`]
    }

    return [this.mainAddress]
  }

  async sign(from: string, message: LotusMessage): Promise<SignedLotusMessage> {
    const addressWithoutCoinType = from.slice(1)

    if (!this.mainAddress.includes(addressWithoutCoinType)) {
      throw new errors.InvalidParamsError({
        message: 'Invalid from address for private key',
      })
    }

    const useTestCoinType = (from[0] as CoinType) === CoinType.TEST
    const { private_hexstring } = signingTools.keyRecover(
      this.#privateKey,
      useTestCoinType,
    )

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

    const { signature } = signingTools.transactionSign(
      msg.toZondaxType(),
      Buffer.from(private_hexstring, 'hex').toString('base64'),
    ) as { signature: { data: string; type: number } }

    return {
      Message: message,
      Signature: {
        Type: signature.type,
        Data: signature.data,
      },
    }
  }
}
