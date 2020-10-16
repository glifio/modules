import LotusRpcEngine from '@glif/filecoin-rpc-client'
import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'
import { WalletSubProvider } from '../wallet-sub-provider'

export type LocalNodeProviderOptions = {
  apiAddress: string
  token?: string
}

export class LocalNodeProvider implements WalletSubProvider {
  readonly apiAddress: string
  readonly token?: string
  readonly jsonRpcEngine: LotusRpcEngine

  constructor(options: LocalNodeProviderOptions) {
    this.apiAddress = options.apiAddress
    this.token = options.token
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: options.apiAddress,
      token: options.token,
    })
  }

  newAccount(): Promise<string> {
    return this.jsonRpcEngine.request<string>('WalletNew', 'secp256k1')
  }

  getAccounts(): Promise<string[]> {
    return this.jsonRpcEngine.request<string[]>('WalletList')
  }

  sign(from: string, message: LotusMessage): Promise<SignedLotusMessage> {
    return this.jsonRpcEngine.request<SignedLotusMessage>(
      'WalletSignMessage',
      from,
      message,
    )
  }
}
