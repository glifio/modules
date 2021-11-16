import { WalletSubProvider } from '@glif/filecoin-wallet-provider'
import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'
import { Network } from '@glif/filecoin-address'
import {
  privateKeyContainer,
  PrivateKeyContainer,
} from './private-key-container'

export class LocalManagedProvider implements WalletSubProvider {
  private readonly privateKey: PrivateKeyContainer
  readonly type = 'SINGLE_KEY'
  constructor(privateKey: string, network: Network) {
    this.privateKey = privateKeyContainer(privateKey, network)
  }

  async getAccounts(): Promise<string[]> {
    return [this.privateKey.address]
  }

  async sign(from: string, message: LotusMessage): Promise<SignedLotusMessage> {
    if (from === this.privateKey.address) {
      return this.privateKey.sign(message)
    } else {
      throw new Error(`Can only sign with address ${this.privateKey.address}`)
    }
  }
}
