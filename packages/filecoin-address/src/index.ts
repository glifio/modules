import * as leb from 'leb128'
import Int64 from 'node-int64'
import { blake2b } from 'blakejs'
import * as uint8arrays from 'uint8arrays'
import { utils } from 'ethers'
import { base32 as base32Function } from './base32'
import { Protocol } from './protocol'
import { CoinType } from './coinType'

export * from './coinType'
export * from './protocol'

const defaultCoinType = CoinType.MAIN
const base32 = base32Function('abcdefghijklmnopqrstuvwxyz234567')

// Defines the hash length taken over addresses
// using the Actor and SECP256K1 protocols.
const payloadHashLength = 20

// The maximum length of a delegated address's sub-address.
const maxSubaddressLen = 54

// The number of bytes that are reserved for namespace
const namespaceByteLen = new Int64(0).toBuffer().length

function addressHash(ingest: Uint8Array): Uint8Array {
  return blake2b(ingest, null, payloadHashLength)
}

export class Address {
  readonly bytes: Uint8Array
  readonly _coinType: CoinType

  constructor(bytes: Uint8Array, coinType: CoinType = defaultCoinType) {
    if (!bytes || !bytes.length) throw new Error('Missing bytes in address')

    this.bytes = bytes
    this._coinType = coinType

    if (!(this.protocol() in Protocol)) {
      throw new Error(`Invalid protocol ${this.protocol()}`)
    }
  }

  network(): CoinType {
    return this._coinType
  }

  coinType(): CoinType {
    return this._coinType
  }

  protocol(): Protocol {
    return this.bytes[0]
  }

  payload(): Uint8Array {
    return this.bytes.slice(1)
  }

  /**
   * toString returns a string representation of this address. If no "coinType"
   * parameter was passed to the constructor the address will be prefixed with
   * the default coinType prefix "f" (mainnet).
   */
  toString(): string {
    return encode(this._coinType, this)
  }

  /**
   * equals determines if this address is the "same" address as the passed
   * address. Two addresses are considered equal if they are the same instance
   * OR if their "bytes" property matches byte for byte.
   */
  equals(addr: Address): boolean {
    if (this === addr) {
      return true
    }
    return uint8arrays.equals(this.bytes, addr.bytes)
  }
}

export function bigintToArray(v: string | bigint | number): Uint8Array {
  let tmp = BigInt(v).toString(16)
  if (tmp.length % 2 === 1) tmp = `0${tmp}`
  return uint8arrays.fromString(tmp, 'base16')
}

export function getChecksum(ingest: string | Uint8Array): Uint8Array {
  return blake2b(ingest, null, 4)
}

export function validateChecksum(
  ingest: string | Uint8Array,
  expect: Uint8Array
) {
  const digest = getChecksum(ingest)
  return uint8arrays.compare(digest, expect)
}

export function newAddress(
  protocol: Protocol,
  payload: Uint8Array,
  coinType?: CoinType
): Address {
  const protocolByte = leb.unsigned.encode(protocol)
  return new Address(uint8arrays.concat([protocolByte, payload]), coinType)
}

export function newIDAddress(
  id: number | string,
  coinType?: CoinType
): Address {
  return newAddress(Protocol.ID, leb.unsigned.encode(id), coinType)
}

/**
 * newActorAddress returns an address using the Actor protocol.
 */
export function newActorAddress(
  data: Uint8Array,
  coinType?: CoinType
): Address {
  return newAddress(Protocol.ACTOR, addressHash(data), coinType)
}

/**
 * newSecp256k1Address returns an address using the SECP256K1 protocol.
 */
export function newSecp256k1Address(
  pubkey: Uint8Array,
  coinType?: CoinType
): Address {
  return newAddress(Protocol.SECP256K1, addressHash(pubkey), coinType)
}

/**
 * newBLSAddress returns an address using the BLS protocol.
 */
export function newBLSAddress(
  pubkey: Uint8Array,
  coinType?: CoinType
): Address {
  return newAddress(Protocol.BLS, pubkey, coinType)
}

/**
 * newDelegatedAddress returns an address using the Delegated protocol.
 */
export function newDelegatedAddress(
  namespace: number,
  subAddr: Uint8Array,
  coinType?: CoinType
): Address {
  if (namespace > Int64.MAX_INT)
    throw new Error('Namespace must be less than 2^63')

  if (subAddr.length > maxSubaddressLen)
    throw new Error('Subaddress address length')

  const namespaceBuf = new Int64(namespace).toBuffer()

  return newAddress(
    Protocol.DELEGATED,
    uint8arrays.concat([namespaceBuf, subAddr]),
    coinType
  )
}

/**
 * newDelegatedEthAddress returns an address for eth using the Delegated protocol.
 */
export function newDelegatedEthAddress(
  ethAddr: string,
  coinType?: CoinType
): Address {
  if (!utils.isAddress(ethAddr)) throw new Error('Invalid Ethereum address')

  return newDelegatedAddress(10, utils.arrayify(ethAddr), coinType)
}

export function decode(address: string): Address {
  checkAddressString(address)

  const coinType = address.slice(0, 1) as CoinType
  /* tslint:disable-next-line:radix */
  const protocol = parseInt(address.slice(1, 2)) as Protocol
  const raw = address.substring(2, address.length)
  const protocolByte = leb.unsigned.encode(protocol)

  if (protocol === Protocol.ID) {
    return newIDAddress(raw, coinType)
  }

  const payloadChecksum = base32.decode(raw)
  const length = payloadChecksum.length
  const payload = payloadChecksum.slice(0, length - 4)
  const checksum = payloadChecksum.slice(length - 4, length)
  if (validateChecksum(uint8arrays.concat([protocolByte, payload]), checksum)) {
    throw Error("Checksums don't match")
  }

  const addressObj = newAddress(protocol, payload, coinType)
  if (encode(coinType, addressObj) !== address)
    throw Error(`Did not encode this address properly: ${address}`)

  return addressObj
}

export function encode(coinType: string, address: Address): string {
  if (!address || !address.bytes) throw Error('Invalid address')

  const protocol = address.protocol()
  const payload = address.payload()
  const prefix = `${coinType}${protocol}`

  switch (protocol) {
    case Protocol.ID: {
      return `${prefix}${leb.unsigned.decode(payload)}`
    }
    case Protocol.DELEGATED: {
      // Retrieve the namespace from the Int64 bytes in the payload
      const nsBytes = new Uint8Array(payload, 0, namespaceByteLen)
      const namespace = new Int64(nsBytes).toNumber()

      // The subaddress is the portion after the namespace
      const subAddr = payload.slice(namespaceByteLen)

      // To calculate the checksum from the address bytes, namespace
      // needs to be a simple Buffer, not the Int64 representation
      const protocolByte = leb.unsigned.encode(protocol)
      const namespaceByte = leb.unsigned.encode(namespace)
      const checksum = getChecksum(
        uint8arrays.concat([protocolByte, namespaceByte, subAddr])
      )

      const bytes = uint8arrays.concat([subAddr, checksum])
      return `${prefix}${namespace}f${base32.encode(bytes)}`
    }
    default: {
      const checksum = getChecksum(address.bytes)
      const bytes = uint8arrays.concat([payload, checksum])
      return `${prefix}${base32.encode(bytes)}`
    }
  }
}

export function newFromString(address: string): Address {
  return decode(address)
}

export function validateAddressString(addressString: string): boolean {
  try {
    checkAddressString(addressString)
    return true
  } catch (error) {
    return false
  }
}

export function checkAddressString(address: string) {
  if (!address) throw Error('No bytes to validate.')
  if (address.length < 3) throw Error('Address is too short to validate.')
  if (address[0] !== 'f' && address[0] !== 't') {
    throw Error('Unknown address coinType.')
  }

  /* tslint:disable-next-line:radix */
  const protocol = parseInt(address[1]) as Protocol
  switch (protocol) {
    case Protocol.ID: {
      if (address.length > 22) throw Error('Invalid ID address length.')
      else if (isNaN(Number(address.slice(2))))
        throw Error('Invalid ID address')
      break
    }
    case Protocol.SECP256K1: {
      if (address.length !== 41)
        throw Error('Invalid secp256k1 address length.')
      break
    }
    case Protocol.ACTOR: {
      if (address.length !== 41) throw Error('Invalid Actor address length.')
      break
    }
    case Protocol.BLS: {
      if (address.length !== 86) throw Error('Invalid BLS address length.')
      break
    }
    default: {
      throw new Error('Invalid address protocol.')
    }
  }
}

/**
 * idFromAddress extracts the ID from an ID address.
 */
export function idFromAddress(address: Address): number {
  if (address.protocol() !== Protocol.ID)
    throw new Error('Cannot get ID from non ID address')
  // An unsigned varint should be less than 2^63 which is < Number.MAX_VALUE.
  // So this number SHOULD be representable in JS and safe to parseInt.
  // https://github.com/multiformats/unsigned-varint
  // TODO: does leb128 enforce the max value?
  return parseInt(leb.unsigned.decode(address.payload()), 10)
}

/**
 * _delegatedFromEthHex is an experimental method for deriving the f410 address from an ethereum hex address
 *
 */

export function _delegatedFromEthHex(
  ethAddr: string,
  coinType: CoinType = CoinType.TEST
) {
  return newDelegatedEthAddress(ethAddr, coinType).toString()
}

export default {
  _delegatedFromEthHex,
  Address,
  newAddress,
  newIDAddress,
  newActorAddress,
  newSecp256k1Address,
  newBLSAddress,
  newFromString,
  bigintToArray,
  decode,
  encode,
  getChecksum,
  validateChecksum,
  validateAddressString,
  checkAddressString,
  idFromAddress,
  CoinType,
  Protocol
}
