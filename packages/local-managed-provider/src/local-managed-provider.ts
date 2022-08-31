import { WalletSubProvider, errors } from '@glif/filecoin-wallet-provider'
import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'
import { CoinType } from '@glif/filecoin-address'
import { KeyType, privateKeyContainer, SignFunc } from './private-key-container'

export class SingleKeyProvider implements WalletSubProvider {
  readonly mainAddress: string
  readonly type: KeyType
  readonly _sign: SignFunc
  #privateKey: string

  constructor(privateKey: string) {
    if (!privateKey) {
      throw new errors.InvalidParamsError({
        message: 'Must pass private key string to single key provider instance'
      })
    }
    const { address, keyType, sign } = privateKeyContainer(
      privateKey,
      CoinType.MAIN
    )
    this.mainAddress = address
    this.type = keyType
    this._sign = sign
    this.#privateKey = privateKey
  }

  async getAccounts(
    _: number,
    __: number,
    coinType: CoinType = CoinType.MAIN
  ): Promise<string[]> {
    if (coinType === CoinType.TEST) {
      return [`t${this.mainAddress.slice(1)}`]
    }

    return [this.mainAddress]
  }

  async keyDerive(_: string): Promise<string> {
    return this.#privateKey
  }

  async sign(from: string, message: LotusMessage): Promise<SignedLotusMessage> {
    const addressWithoutCoinType = from.slice(1)

    if (!this.mainAddress.includes(addressWithoutCoinType)) {
      throw new errors.InvalidParamsError({
        message: 'Invalid from address for private key'
      })
    }

    return this._sign(message)
  }
}
