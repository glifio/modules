import * as leb from 'leb128'
import { blake2b } from 'blakejs'
import { base32 as base32Function } from './base32'
import * as uint8arrays from 'uint8arrays'
import { Protocol } from './protocol'
import { Network } from './network'

export * from './network'
export * from './protocol'

const defaultNetwork = Network.MAIN
const base32 = base32Function('abcdefghijklmnopqrstuvwxyz234567')

// PayloadHashLength defines the hash length taken over addresses using the
// Actor and SECP256K1 protocols.
const payloadHashLength = 20

function addressHash (ingest: Uint8Array): Uint8Array {
  return blake2b(ingest, null, payloadHashLength)
}

export class Address {
  readonly str: Uint8Array
  readonly _protocol: Protocol
  readonly _network: Network

  constructor(str: Uint8Array, network: Network = defaultNetwork) {
    if (!str || str.length < 1) throw new Error('Missing str in address')
    this.str = str
    this._protocol = this.str[0] as Protocol
    if (!Protocol[this._protocol]) {
      throw new Error(`Invalid protocol ${this._protocol}`)
    }
    this._network = network
  }

  network(): Network {
    return this._network
  }

  protocol(): Protocol {
    return this._protocol
  }

  payload(): Uint8Array {
    return this.str.slice(1, this.str.length)
  }

  /**
   * toString returns a string representation of this address. If no "network"
   * parameter was passed to the constructor the address will be prefixed with
   * the default network prefix "f" (mainnet).
   */
  toString (): string {
    return encode(this._network, this)
  }

  /**
   * equals determines if this address is the "same" address as the passed
   * address. Two addresses are considered equal if they are the same instance
   * OR if their "str" property matches byte for byte.
   */
  equals (addr: Address): boolean {
    if (this === addr) {
      return true
    }
    return uint8arrays.equals(this.str, addr.str)
  }
}

export function bigintToArray(v: string | BigInt | number): Uint8Array {
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

export function newAddress(protocol: Protocol, payload: Uint8Array, network: Network = defaultNetwork): Address {
  const protocolByte = new Uint8Array([protocol])
  return new Address(uint8arrays.concat([protocolByte, payload]), network)
}

export function newIDAddress(id: number|string, network: Network = defaultNetwork): Address {
  return newAddress(Protocol.ID, leb.unsigned.encode(id), network)
}

/**
 * newActorAddress returns an address using the Actor protocol.
 */
export function newActorAddress (data: Uint8Array): Address {
  return newAddress(Protocol.ACTOR, addressHash(data))
}

/**
 * newSecp256k1Address returns an address using the SECP256K1 protocol.
 */
export function newSecp256k1Address (pubkey: Uint8Array): Address {
  return newAddress(Protocol.SECP256K1, addressHash(pubkey))
}

/**
 * newBLSAddress returns an address using the BLS protocol.
 */
export function newBLSAddress (pubkey: Uint8Array): Address {
  return newAddress(Protocol.BLS, pubkey)
}

export function decode(address: string): Address {
  checkAddressString(address)

  const network = address.slice(0, 1) as Network
  /* tslint:disable-next-line:radix */
  const protocol = parseInt(address.slice(1, 2)) as Protocol
  const raw = address.substring(2, address.length)
  const protocolByte = new Uint8Array([protocol])

  if (protocol === Protocol.ID) {
    return newIDAddress(raw, network)
  }

  const payloadChecksum = base32.decode(raw)
  const length = payloadChecksum.length
  const payload = payloadChecksum.slice(0, length - 4)
  const checksum = payloadChecksum.slice(length - 4, length)
  if (validateChecksum(uint8arrays.concat([protocolByte, payload]), checksum)) {
    throw Error("Checksums don't match")
  }

  const addressObj = newAddress(protocol, payload, network)
  if (encode(network, addressObj) !== address)
    throw Error(`Did not encode this address properly: ${address}`)

  return addressObj
}

export function encode(network: string, address: Address): string {
  if (!address || !address.str) throw Error('Invalid address')
  const payload = address.payload()

  switch (address.protocol()) {
    case 0: {
      return (
        network +
        String(address.protocol()) +
        leb.unsigned.decode(address.payload())
      )
    }
    default: {
      const protocolByte = new Uint8Array([address.protocol()])
      const checksum = getChecksum(uint8arrays.concat([protocolByte, payload]))
      const bytes = uint8arrays.concat([payload, checksum])
      return String(network) + String(address.protocol()) + base32.encode(bytes)
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
    throw Error('Unknown address network.')
  }

  /* tslint:disable-next-line:radix */
  const protocol = parseInt(address[1]) as Protocol
  switch (protocol) {
    case Protocol.ID: {
      if (address.length > 22) throw Error('Invalid ID address length.')
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
export function idFromAddress (address: Address): number {
  if (address.protocol() !== Protocol.ID)
    throw new Error('Cannot get ID from non ID address')
  // An unsigned varint should be less than 2^63 which is < Number.MAX_VALUE.
  // So this number SHOULD be representable in JS and safe to parseInt.
  // https://github.com/multiformats/unsigned-varint
  // TODO: does leb128 enforce the max value?
  return parseInt(leb.unsigned.decode(address.payload()), 10)
}

export default {
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
  Network,
  Protocol
}
