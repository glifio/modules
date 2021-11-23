import { WalletSubProvider, errors } from '@glif/filecoin-wallet-provider'
import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'
import { CoinType } from '@glif/filecoin-address'
import {
  privateKeyContainer,
  PrivateKeyContainer,
} from './private-key-container'

export class SingleKeyProvider implements WalletSubProvider {
  #privateKey: string
  coinTypeToAddress: Record<CoinType, string> = {
    [CoinType.MAIN]: '',
    [CoinType.TEST]: '',
  }
  readonly type = 'SINGLE_KEY'
  constructor(privateKey: string) {
    if (!privateKey) {
      throw new errors.InvalidParamsError({
        message: 'Must pass private key string to single key provider instance',
      })
    }
    this.#privateKey = privateKey
    this.coinTypeToAddress[CoinType.MAIN] = privateKeyContainer(
      privateKey,
      CoinType.MAIN,
    ).address
    this.coinTypeToAddress[CoinType.TEST] = privateKeyContainer(
      privateKey,
      CoinType.TEST,
    ).address
  }

  async getAccounts(
    _: number,
    __: number,
    coinType: CoinType = CoinType.MAIN,
  ): Promise<string[]> {
    return [this.coinTypeToAddress[coinType]]
  }

  async sign(from: string, message: LotusMessage): Promise<SignedLotusMessage> {
    let pk: PrivateKeyContainer

    if (this.coinTypeToAddress[CoinType.MAIN] === from) {
      pk = privateKeyContainer(this.#privateKey, CoinType.MAIN)
    } else if (this.coinTypeToAddress[CoinType.TEST] === from) {
      pk = privateKeyContainer(this.#privateKey, CoinType.TEST)
    } else {
      throw new errors.InvalidParamsError({
        message: 'Invalid from address for private key',
      })
    }

    return pk.sign(message)
  }
}
