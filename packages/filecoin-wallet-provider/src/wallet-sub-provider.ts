import { LotusMessage } from '@glif/filecoin-message'

export enum Network {
  MAIN = 'f',
  TEST = 't',
}

// path looks like m/44'/461'/1'/0/0/0 -
export type SignFunc = (message: LotusMessage, path: string) => Promise<string>

export type GetAccountsFunc = (
  network: Network,
  startIdx: number,
  endIdx: number,
) => string[]

export interface WalletSubProvider {
  sign: SignFunc
  getAccounts: GetAccountsFunc
}
