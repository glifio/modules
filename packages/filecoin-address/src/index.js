/* eslint-disable radix,prefer-const */
const leb = require('leb128')
const { blake2b } = require('blakejs')
const base32Function = require('./base32')

const base32 = base32Function('abcdefghijklmnopqrstuvwxyz234567')

let newAddress
let newFromString
let decode
let encode
let bigintToArray
let getChecksum
let validateChecksum
let validateAddressString
let checkAddressString

class Address {
  constructor(str) {
    if (!str || str.length < 1) throw new Error('Missing str in address')
    this.str = str
  }

  protocol = () => {
    if (this.str.length < 1) {
      return Error('No address found.')
    }
    return this.str[0]
  }

  payload = () => {
    if (this.str.length < 1) {
      return Error('No address found.')
    }
    return this.str.slice(1, this.str.length)
  }
}

bigintToArray = v => {
  // eslint-disable-next-line no-undef
  let tmp = BigInt(v).toString(16)
  if (tmp.length % 2 === 1) tmp = `0${tmp}`
  return Buffer.from(tmp, 'hex')
}

getChecksum = ingest => {
  return blake2b(ingest, null, 4)
}

validateChecksum = (ingest, expect) => {
  const digest = getChecksum(ingest)
  return Buffer.compare(Buffer.from(digest), expect)
}

newAddress = (protocol, payload) => {
  const protocolByte = new Buffer.alloc(1)
  protocolByte[0] = protocol

  return new Address(Buffer.concat([protocolByte, payload]))
}

decode = address => {
  checkAddressString(address)

  const network = address.slice(0, 1)
  const protocol = address.slice(1, 2)
  const protocolByte = new Buffer.alloc(1)
  protocolByte[0] = protocol
  const raw = address.substring(2, address.length)

  if (protocol === '0') {
    return newAddress(protocol, Buffer.from(leb.unsigned.encode(raw)))
  }

  const payloadChecksum = new Buffer.from(base32.decode(raw))
  const { length } = payloadChecksum
  const payload = payloadChecksum.slice(0, length - 4)
  const checksum = payloadChecksum.slice(length - 4, length)
  if (validateChecksum(Buffer.concat([protocolByte, payload]), checksum)) {
    throw Error("Checksums don't match")
  }

  const addressObj = newAddress(protocol, payload)
  if (encode(network, addressObj) !== address)
    throw Error(`Did not encode this address properly: ${address}`)

  return addressObj
}

encode = (network, address) => {
  if (!address || !address.str) throw Error('Invalid address')
  let addressString = ''
  const payload = address.payload()

  switch (address.protocol()) {
    case 0: {
      addressString =
        network +
        String(address.protocol()) +
        leb.unsigned.decode(address.payload())
      break
    }
    default: {
      const protocolByte = new Buffer.alloc(1)
      protocolByte[0] = address.protocol()
      const checksum = getChecksum(Buffer.concat([protocolByte, payload]))
      const bytes = Buffer.concat([payload, Buffer.from(checksum)])
      addressString =
        String(network) + String(address.protocol()) + base32.encode(bytes)
      break
    }
  }

  return addressString
}

newFromString = address => {
  return decode(address)
}

validateAddressString = string => {
  try {
    checkAddressString(string)
    return true
  } catch (error) {
    return false
  }
}

checkAddressString = address => {
  if (!address) throw Error('No bytes to validate.')
  if (address.length < 3) throw Error('Address is too short to validate.')
  if (address[0] !== 'f' && address[0] !== 't') {
    throw Error('Unknown address network.')
  }

  switch (address[1]) {
    case '0': {
      if (address.length > 22) throw Error('Invalid ID address length.')
      break
    }
    case '1': {
      if (address.length !== 41)
        throw Error('Invalid secp256k1 address length.')
      break
    }
    case '2': {
      if (address.length !== 41) throw Error('Invalid Actor address length.')
      break
    }
    case '3': {
      if (address.length !== 86) throw Error('Invalid BLS address length.')
      break
    }
    default: {
      throw new Error('Invalid address protocol.')
    }
  }
}

module.exports = {
  Address,
  newAddress,
  newFromString,
  bigintToArray,
  decode,
  encode,
  getChecksum,
  validateChecksum,
  validateAddressString,
  checkAddressString
}
