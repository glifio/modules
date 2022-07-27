import { LotusMessage, SignedLotusMessage } from '@glif/filecoin-message'
import { CoinType } from '@glif/filecoin-address'
import { WalletType } from './types'

export interface WalletSubProvider {
  getAccounts(
    nStart: number,
    nEnd: number,
    coinType: CoinType,
  ): Promise<string[]>
  keyDerive(path: string): Promise<string>
  sign(from: string, message: LotusMessage): Promise<SignedLotusMessage>
  type: WalletType
}
