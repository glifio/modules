import { JsonFragment } from '@ethersproject/abi'
import { Fragment } from 'ethers/lib/utils'

export type ABI = ReadonlyArray<Fragment | JsonFragment | string>

/**
 * Returns a hex representation of a base64 encoded cbor string
 */

export const cborToHex = (b64Cbor: string): string => {
  // TODO: https://www.rfc-editor.org/rfc/rfc7049#section-2.1 need to decode this properly
  const paramsBuffer = Buffer.from(b64Cbor, 'base64').subarray(2)
  return `0x${paramsBuffer.toString('hex')}`
}
