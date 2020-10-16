import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'

export interface WalletSubProvider {
  newAccount?(): Promise<string>
  getAccounts(): Promise<string[]>
  sign(from: string, message: LotusMessage): Promise<SignedLotusMessage>
}
