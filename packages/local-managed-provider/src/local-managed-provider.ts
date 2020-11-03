import { Network, WalletSubProvider } from '@glif/filecoin-wallet-provider'
import { SignedLotusMessage } from '@glif/filecoin-message'
import { ExtendedKey, MessageParams } from '@zondax/filecoin-signing-tools'
import uint8arrays from 'uint8arrays'

const moduleToImport = process.env.JEST_WORKER_ID
  ? "@zondax/filecoin-signing-tools/nodejs"
  : "@zondax/filecoin-signing-tools";
// tslint:disable-next-line:no-var-requires
const signingTools = require(moduleToImport);

export class LocalManagedProvider implements WalletSubProvider {
  private readonly privateKey: ExtendedKey

  constructor(privateKey: string, network: Network) {
    const bytes = uint8arrays.fromString(privateKey, 'base16')
    const json = JSON.parse(uint8arrays.toString(bytes))
    const keyType = json.Type
    const testnet = network === Network.TEST
    if (keyType === 'bls') {
      this.privateKey = signingTools.keyRecoverBLS(json.PrivateKey, testnet)
    } else if (keyType === 'secp256k1') {
      this.privateKey = signingTools.keyRecover(json.PrivateKey, testnet)
    } else {
      throw new Error(`Unknown key type: ${keyType}`)
    }
  }

  async getAccounts(): Promise<string[]> {
    return [this.privateKey.address]
  }

  async sign(
    from: string,
    message: MessageParams,
  ): Promise<SignedLotusMessage> {
    if (from === this.privateKey.address) {
      const asString = await signingTools.transactionSignLotus(
        message,
        this.privateKey.private_base64,
      )
      return JSON.parse((asString as unknown) as string)
    } else {
      throw new Error(`Can only sign with address ${this.privateKey.address}`)
    }
  }
}
