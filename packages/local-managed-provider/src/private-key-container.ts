import { CoinType } from '@glif/filecoin-address'
import { fromString, toString } from 'uint8arrays'
import { ExtendedKey, MessageParams } from '@zondax/filecoin-signing-tools'
import { SignedLotusMessage } from '@glif/filecoin-message'
import * as signingTools from '@zondax/filecoin-signing-tools'

export enum KeyType {
  'bls' = 'SINGLE_KEY_BLS',
  'secp256k1' = 'SINGLE_KEY_SECP256K1'
}

export type SignFunc = (message: MessageParams) => Promise<SignedLotusMessage>

export interface PrivateKeyContainer {
  address: string
  sign: SignFunc
  keyType: KeyType
}

export function privateKeyContainer(
  privateKey: string,
  coinType: CoinType
): PrivateKeyContainer {
  const bytes = fromString(privateKey, 'base16')
  const json = JSON.parse(toString(bytes))
  const keyType = json.Type as 'bls' | 'secp256k1'
  const testnet = coinType === CoinType.TEST
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
        extendedKey.private_base64
      )
      return JSON.parse(asString as unknown as string)
    },
    keyType: KeyType[keyType]
  }
}
