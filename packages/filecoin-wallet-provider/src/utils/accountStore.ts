import { errors } from '../errors'

// maps derived addresses to their path
export class AccountStore {
  private accountToPath: Record<string, string> = {}

  setAccountPath = (account: string, path: string) => {
    this.accountToPath[account.slice(1)] = path
  }

  getPath = (account: string): string => {
    const path = this.accountToPath[account.slice(1)]

    if (!path) {
      throw new errors.WalletProviderError({
        message: 'Account was not yet derived from this seed phrase',
      })
    }

    return path
  }
}
