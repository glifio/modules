import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'
import { Network } from '@glif/filecoin-address'

export interface WalletSubProvider {
  newAccount?(): Promise<string>
  getAccounts(nStart: number, nEnd: number, network: Network): Promise<string[]>
  sign(from: string, message: LotusMessage): Promise<SignedLotusMessage>
}
