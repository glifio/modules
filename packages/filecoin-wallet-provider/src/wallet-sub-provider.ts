import { LotusMessage } from '@glif/filecoin-message'
import { SignedMessage } from "./utils/signed-message";

export interface WalletSubProvider {
  newAccount?(): Promise<string>
  getAccounts(): Promise<string[]>
  sign(from: string, message: LotusMessage): Promise<SignedMessage>
}
