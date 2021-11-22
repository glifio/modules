import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'
import { CoinType } from '@glif/filecoin-address'

export interface WalletSubProvider {
  newAccount?(): Promise<string>
  getAccounts(
    nStart: number,
    nEnd: number,
    network: CoinType,
  ): Promise<string[]>
  sign(from: string, message: LotusMessage): Promise<SignedLotusMessage>
  type: string
}
