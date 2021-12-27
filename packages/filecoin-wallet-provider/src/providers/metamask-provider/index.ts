import { FilecoinSnapApi } from '@chainsafe/filsnap-types'
import { CoinType } from '@glif/filecoin-address'
import {
  LotusMessage,
  Message,
  SignedLotusMessage,
} from '@glif/filecoin-message'
import signingTools from '@zondax/filecoin-signing-tools/js'
import { WalletType } from '../../types'
import { errors } from '../../errors'
import { WalletSubProvider } from '../../wallet-sub-provider'

export class MetaMaskProvider implements WalletSubProvider {
  public type: WalletType = 'METAMASK'
  private snap: FilecoinSnapApi

  constructor({ snap }: { snap: FilecoinSnapApi }) {
    this.snap = snap
  }

  // right now only 1 account and 1 cointype is supported
  getAccounts = async (nStart = 0, nEnd = 5, coinType = CoinType.MAIN) => {
    try {
      const account = await this.snap.getAddress()
      return [account]
    } catch (err) {
      throw new errors.MetaMaskError({
        message: 'Error getting account from MetaMask',
      })
    }
  }

  sign = async (
    from: string,
    message: LotusMessage,
  ): Promise<SignedLotusMessage> => {
    console.log('about to sign', from, message)
    if (from !== message.From) {
      throw new errors.InvalidParamsError({ message: 'From address mismatch' })
    }
    let msg
    try {
      msg = Message.fromLotusType(message)
    } catch (err) {
      throw new errors.InvalidParamsError(
        err instanceof Error
          ? {
              message: `Invalid message params passed to sign call: ${err.message}`,
            }
          : undefined,
      )
    }

    // use transactionSign instead of transactionSignRaw to show in the MetaMask UI
    if (message.Method === 0) {
      const { signature } = await this.snap.signMessage(msg.toZondaxType())
      return {
        Message: message,
        Signature: {
          Data: signature.data,
          Type: signature.type,
        },
      }
    }

    const serializedMessage = signingTools.transactionSerialize(
      msg.toZondaxType(),
    )
    const sig = await this.snap.signMessageRaw(serializedMessage)
    return {
      Message: message,
      Signature: {
        Data: sig,
        Type: 1,
      },
    }
  }
}
