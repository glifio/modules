import { Network } from '@glif/filecoin-address'
import uint8arrays from 'uint8arrays'
import { ExtendedKey, MessageParams } from '@zondax/filecoin-signing-tools'
import { SignedLotusMessage } from '@glif/filecoin-message'
import * as signingTools from '@zondax/filecoin-signing-tools'

export interface PrivateKeyContainer {
  address: string
  sign(message: MessageParams): Promise<SignedLotusMessage>
}

export function privateKeyContainer(
  privateKey: string,
  network: Network,
): PrivateKeyContainer {
  const bytes = uint8arrays.fromString(privateKey, 'base16')
  const json = JSON.parse(uint8arrays.toString(bytes))
  const keyType = json.Type
  const testnet = network === Network.TEST
  let extendedKey: ExtendedKey
  if (keyType === 'bls') {
    extendedKey = signingTools.keyRecoverBLS(json.PrivateKey, testnet)
  } else if (keyType === 'secp256k1') {
    extendedKey = signingTools.keyRecover(json.PrivateKey, testnet)
  } else {
    throw new Error(`Unknown key type: ${keyType}`)
  }

  return {
    address: extendedKey.address,
    sign: async (message: MessageParams) => {
      const asString = await signingTools.transactionSignLotus(
        message,
        extendedKey.private_base64,
      )
      return JSON.parse((asString as unknown) as string)
    },
  }
}
