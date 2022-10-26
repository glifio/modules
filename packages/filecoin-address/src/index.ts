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

interface AddressData {
  protocol: Protocol
  payload: Uint8Array
  coinType: CoinType
}

const defaultCoinType = CoinType.MAIN
const base32 = base32Function('abcdefghijklmnopqrstuvwxyz234567')

// Store valid CoinTypes / Protocols for runtime validation
const coinTypes = Object.values(CoinType)
const protocols = Object.values(Protocol).filter(p => typeof p === 'number')

// Defines the hash length taken over addresses
// using the Actor and SECP256K1 protocols.
const payloadHashLength = 20

// The length of a BLS public key
const blsPublicKeyBytes = 48

// The maximum length of a delegated address's sub-address.
const maxSubaddressLen = 54

// The number of bytes that are reserved for namespace
const namespaceByteLen = new Int64(0).toBuffer().length

// The maximum length of `int64` as a string.
const maxInt64StringLength = 19

// The hash length used for calculating address checksums.
const checksumHashLength = 4

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
  return blake2b(ingest, null, checksumHashLength)
}

export function validateChecksum(
  data: string | Uint8Array,
  checksum: Uint8Array
): boolean {
  return uint8arrays.equals(getChecksum(data), checksum)
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
  const { protocol, payload, coinType } = checkAddressString(address)
  return newAddress(protocol, payload, coinType)
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
      const namespaceBytes = new Uint8Array(payload, 0, namespaceByteLen)
      const namespaceNumber = new Int64(namespaceBytes).toNumber()

      // The subaddress is the portion after the namespace
      const subAddrBytes = payload.slice(namespaceByteLen)

      // To calculate the checksum from the address bytes, namespace
      // needs to be a simple Buffer, not the Int64 representation
      const protocolByte = leb.unsigned.encode(protocol)
      const namespaceByte = leb.unsigned.encode(namespaceNumber)
      const checksumBytes = getChecksum(
        uint8arrays.concat([protocolByte, namespaceByte, subAddrBytes])
      )

      const bytes = uint8arrays.concat([subAddrBytes, checksumBytes])
      return `${prefix}${namespaceNumber}f${base32.encode(bytes)}`
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

export function checkAddressString(address: string): AddressData {
  if (typeof address !== 'string' || address.length < 3)
    throw Error('Address should be a string of at least 3 characters')

  const coinType = address[0] as CoinType
  if (!coinTypes.includes(coinType))
    throw Error(`Address cointype should be one of: ${coinTypes.join(', ')}`)

  const protocol = Number(address[1]) as Protocol
  if (!protocols.includes(protocol))
    throw Error(`Address protocol should be one of: ${protocols.join(', ')}`)

  const raw = address.slice(2)

  switch (protocol) {
    case Protocol.ID: {
      if (raw.length > maxInt64StringLength)
        throw Error('Invalid ID address length')
      if (isNaN(Number(raw))) throw Error('Invalid ID address')
      const payload = leb.unsigned.encode(raw)
      return { protocol, payload, coinType }
    }

    case Protocol.DELEGATED: {
      const splitIndex = raw.indexOf('f')
      if (splitIndex === -1) throw new Error('Invalid delegated address')

      const namespaceStr = raw.slice(0, splitIndex)
      if (namespaceStr.length > maxInt64StringLength)
        throw new Error('Invalid delegated address namespace')

      const subAddrCksmStr = raw.slice(splitIndex + 1)
      const subAddrCksmBytes = base32.decode(subAddrCksmStr)
      if (subAddrCksmBytes.length < checksumHashLength)
        throw Error('Invalid delegated address length')

      const subAddrBytes = subAddrCksmBytes.slice(0, -checksumHashLength)
      const checksumBytes = subAddrCksmBytes.slice(subAddrBytes.length)
      if (subAddrBytes.length > maxSubaddressLen)
        throw Error('Invalid delegated address length')

      const protocolByte = leb.unsigned.encode(protocol)
      const namespaceNumber = Number(namespaceStr)
      const namespaceByte = leb.unsigned.encode(namespaceNumber)
      const bytes = uint8arrays.concat([
        protocolByte,
        namespaceByte,
        subAddrBytes
      ])

      if (!validateChecksum(bytes, checksumBytes))
        throw Error('Invalid delegated address checksum')

      const namespaceBuf = new Int64(namespaceNumber).toBuffer()
      const payload = uint8arrays.concat([namespaceBuf, subAddrBytes])
      return { protocol, payload, coinType }
    }

    case Protocol.SECP256K1:
    case Protocol.ACTOR:
    case Protocol.BLS: {
      const payloadCksm = base32.decode(raw)
      if (payloadCksm.length < checksumHashLength)
        throw Error('Invalid address length')

      const payload = payloadCksm.slice(0, -checksumHashLength)
      const checksum = payloadCksm.slice(payload.length)

      if (protocol === Protocol.SECP256K1 || protocol === Protocol.ACTOR)
        if (payload.length !== payloadHashLength)
          throw Error('Invalid address length')

      if (protocol === Protocol.BLS)
        if (payload.length !== blsPublicKeyBytes)
          throw Error('Invalid address length')

      const protocolByte = leb.unsigned.encode(protocol)
      const bytes = uint8arrays.concat([protocolByte, payload])
      if (!validateChecksum(bytes, checksum))
        throw Error('Invalid address checksum')

      return { protocol, payload, coinType }
    }

    default:
      throw Error(`Invalid address protocall: ${protocol}`)
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
