import { FilecoinSnapApi } from '@chainsafe/filsnap-types'
import { CoinType } from '@glif/filecoin-address'
import {
  LotusMessage,
  Message,
  SignedLotusMessage,
} from '@glif/filecoin-message'
import { WalletType } from '../../types'
import { WalletSubProvider } from '../../wallet-sub-provider'

export class MetaMaskProvider implements WalletSubProvider {
  public type: WalletType = 'METAMASK'
  private snap: FilecoinSnapApi

  constructor({ snap }: { snap: FilecoinSnapApi }) {
    this.snap = snap
  }

  // right now only 1 account and 1 cointype is supported
  getAccounts = async (nStart = 0, nEnd = 5, coinType = CoinType) => {
    return []
  }

  sign = async (
    from: string,
    message: LotusMessage,
  ): Promise<SignedLotusMessage> => {
    return {}
  }
}
