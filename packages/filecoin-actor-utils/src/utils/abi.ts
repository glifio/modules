import { Fragment, JsonFragment } from '@ethersproject/abi'
import { fromString, toString } from 'uint8arrays'
import { decode } from '@ipld/dag-cbor'

export type ABI = ReadonlyArray<Fragment | JsonFragment | string>

/**
 * Returns a hex representation of a base64 encoded cbor string
 */

export const cborToHex = (base64: string): string => {
  const data = fromString(base64, 'base64')
  const decoded = decode<Uint8Array>(data)
  return `0x${toString(decoded, 'hex')}`
}
