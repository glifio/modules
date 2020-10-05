import LotusRpcEngine from '@glif/filecoin-rpc-client'

class LocalNodeProvider {
  constructor({ apiAddress, token }) {
    this.apiAddress = apiAddress
    this.token = token
    this.jsonRpcEngine = new LotusRpcEngine({ apiAddress, token })
  }

  newAccount = () => this.jsonRpcEngine.request('WalletNew', 'secp256k1')

  getAccounts = () => this.jsonRpcEngine.request('WalletList')

  sign = (from, message) =>
    this.jsonRpcEngine.request('WalletSignMessage', from, message)
}

export default LocalNodeProvider
