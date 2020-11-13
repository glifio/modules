import * as leb from 'leb128'
import { blake2b } from 'blakejs'
import { base32 as base32Function } from './base32'
import * as uint8arrays from 'uint8arrays'
import { Protocol } from './protocol'
import { Network } from './network'

const base32 = base32Function('abcdefghijklmnopqrstuvwxyz234567')

export class Address {
  readonly str: Uint8Array
  readonly _protocol: Protocol

  constructor(str: Uint8Array) {
    if (!str || str.length < 1) throw new Error('Missing str in address')
    this.str = str
    this._protocol = this.str[0] as Protocol
    if (!Protocol[this._protocol]) {
      throw new Error(`Invalid protocol ${this._protocol}`)
    }
  }

  protocol(): Protocol {
    return this._protocol
  }

  payload(): Uint8Array {
    return this.str.slice(1, this.str.length)
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
  return Buffer.compare(Buffer.from(digest), expect)
}

export function newAddress(protocol: Protocol, payload: Uint8Array): Address {
  const protocolByte = new Uint8Array([protocol])
  return new Address(Buffer.concat([protocolByte, payload]))
}

export function checkAddressString(address: string) {
  if (!address) throw Error('No bytes to validate.')
  if (address.length < 3) throw Error('Address is too short to validate.')
  if (address[0] !== 'f' && address[0] !== 't') {
    throw Error('Unknown address network.')
  }

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

export function decode(address: string): Address {
  checkAddressString(address)

  const network = address.slice(0, 1) as Network
  const protocol = parseInt(address.slice(1, 2)) as Protocol
  const raw = address.substring(2, address.length)
  const protocolByte = new Uint8Array([protocol])

  if (protocol === Protocol.ID) {
    return newAddress(protocol, Buffer.from(leb.unsigned.encode(raw)))
  }

  const payloadChecksum: Uint8Array = base32.decode(raw)
  const length = payloadChecksum.length
  const payload = payloadChecksum.slice(0, length - 4)
  const checksum = payloadChecksum.slice(length - 4, length)
  if (validateChecksum(uint8arrays.concat([protocolByte, payload]), checksum)) {
    throw Error("Checksums don't match")
  }

  const addressObj = newAddress(protocol, payload)
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
      const checksum = getChecksum(Buffer.concat([protocolByte, payload]))
      const bytes = Buffer.concat([payload, Buffer.from(checksum)])
      return String(network) + String(address.protocol()) + base32.encode(bytes)
    }
  }
}

export function newFromString(address: string): Address {
  return decode(address)
}

export function validateAddressString(string: string): boolean {
  try {
    checkAddressString(string)
    return true
  } catch (error) {
    return false
  }
}
