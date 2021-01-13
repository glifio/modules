import * as uint8arrays from 'uint8arrays'
import {
  actorAddresses,
  BLSAddresses,
  IDAddresses,
  secp256k1Addresses
} from './constants'
import { encode, decode, newFromString, validateAddressString, newIDAddress, Network, Address } from '../index'

describe('address', () => {
  describe('newIDAddress', () => {
    test('it should create new ID addresses', async () => {
      IDAddresses.forEach(item => {
        const address = newIDAddress(item.string.slice(2))
        expect(
          uint8arrays.equals(
            Uint8Array.from(address.str),
            item.decodedByteArray
          )
        ).toBe(true)
      })
    })
  })
  describe('newFromString', () => {
    test('it should create new ID addresses', async () => {
      IDAddresses.forEach(item => {
        const address = newFromString(item.string)
        expect(
          uint8arrays.equals(
            Uint8Array.from(address.str),
            item.decodedByteArray
          )
        ).toBe(true)
      })
    })

    test('it should create new secp256k1 addresses', async () => {
      secp256k1Addresses.forEach(item => {
        const address = newFromString(item.string)
        expect(
          uint8arrays.equals(
            Uint8Array.from(address.str),
            item.decodedByteArray
          )
        ).toBe(true)
      })
    })

    test('it should create new BLS addresses', async () => {
      BLSAddresses.forEach(item => {
        const address = newFromString(item.string)
        expect(
          uint8arrays.equals(
            Uint8Array.from(address.str),
            item.decodedByteArray
          )
        ).toBe(true)
      })
    })

    test('it should create new Actor addresses', async () => {
      actorAddresses.forEach(item => {
        const address = newFromString(item.string)
        expect(
          uint8arrays.equals(
            Uint8Array.from(address.str),
            item.decodedByteArray
          )
        ).toBe(true)
      })
    })

    test('it should throw when given a bad ID addresses', async () => {
      expect(() => newFromString('t0')).toThrow()
    })
  })

  describe('encode', () => {
    test('it should encode an ID address', async () => {
      const address = newFromString(IDAddresses[0].string)
      expect(encode('t', address)).toBe(IDAddresses[0].string)
    })

    test('it should encode a secp256k1 address', async () => {
      const address = newFromString(secp256k1Addresses[0].string)
      expect(encode('t', address)).toBe(secp256k1Addresses[0].string)
    })

    test('it should encode a BLS address', async () => {
      const address = newFromString(BLSAddresses[0].string)
      expect(encode('t', address)).toBe(BLSAddresses[0].string)
    })

    test('it should encode an Actor address', async () => {
      const address = newFromString(actorAddresses[0].string)
      expect(encode('t', address)).toBe(actorAddresses[0].string)
    })
  })

  describe('decode', () => {
    test('it should preserve testnet network', () => {
      const addressStr = `${Network.TEST}${IDAddresses[0].string.slice(1)}`
      const address = decode(addressStr)
      expect(address.network()).toBe(Network.TEST)
      expect(address.toString()).toBe(addressStr)
    })

    test('it should preserve mainnet network', () => {
      const addressStr = `${Network.MAIN}${IDAddresses[0].string.slice(1)}`
      const address = decode(addressStr)
      expect(address.network()).toBe(Network.MAIN)
      expect(address.toString()).toBe(addressStr)
    })
  })

  describe('toString', () => {
    test('it should stringify ID addresses', () => {
      IDAddresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, Network.TEST)
        expect(`${tAddr}`).toBe(`${Network.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, Network.MAIN)
        expect(`${fAddr}`).toBe(`${Network.MAIN}${item.string.slice(1)}`)
      })
    })

    test('it should stringify secp256k1 addresses', () => {
      secp256k1Addresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, Network.TEST)
        expect(`${tAddr}`).toBe(`${Network.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, Network.MAIN)
        expect(`${fAddr}`).toBe(`${Network.MAIN}${item.string.slice(1)}`)
      })
    })

    test('it should stringify BLS addresses', () => {
      BLSAddresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, Network.TEST)
        expect(`${tAddr}`).toBe(`${Network.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, Network.MAIN)
        expect(`${fAddr}`).toBe(`${Network.MAIN}${item.string.slice(1)}`)
      })
    })

    test('it should stringify Actor addresses', () => {
      actorAddresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, Network.TEST)
        expect(`${tAddr}`).toBe(`${Network.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, Network.MAIN)
        expect(`${fAddr}`).toBe(`${Network.MAIN}${item.string.slice(1)}`)
      })
    })
  })

  describe('validateAddressString', () => {
    test("it should invalidate address that's too short", async () => {
      expect(validateAddressString('t0')).toBe(false)
    })

    test("it should invalidate ID address that's too long", async () => {
      expect(
        validateAddressString('t000000000000000000000000000000000000000')
      ).toBe(false)
    })

    test('it should validate good ID address', async () => {
      expect(validateAddressString('t099')).toBe(true)
    })

    test("it should invalidate secp256k1 address that's too short", async () => {
      expect(validateAddressString('t100')).toBe(false)
    })

    test("it should invalidate secp256k1 address that's too long", async () => {
      expect(
        validateAddressString('t100000000000000000000000000000000000000')
      ).toBe(false)
    })

    test('it should validate good secp256k1 address', async () => {
      expect(
        validateAddressString('t15ihq5ibzwki2b4ep2f46avlkrqzhpqgtga7pdrq')
      ).toBe(true)
    })

    test("it should invalidate actor address that's too short", async () => {
      expect(validateAddressString('t100')).toBe(false)
    })

    test("it should invalidate actor address that's too long", async () => {
      expect(
        validateAddressString('t200000000000000000000000000000000000000')
      ).toBe(false)
    })

    test('it should validate good actor address', async () => {
      expect(
        validateAddressString('t24vg6ut43yw2h2jqydgbg2xq7x6f4kub3bg6as6i')
      ).toBe(true)
    })

    test("it should invalidate BLS address that's too short", async () => {
      expect(validateAddressString('t300')).toBe(false)
    })

    test("it should invalidate BLS address that's too long", async () => {
      expect(
        validateAddressString(
          't3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        )
      ).toBe(false)
    })

    test('it should validate good BLS address', async () => {
      expect(
        validateAddressString(
          't3vvmn62lofvhjd2ugzca6sof2j2ubwok6cj4xxbfzz4yuxfkgobpihhd2thlanmsh3w2ptld2gqkn2jvlss4a'
        )
      ).toBe(true)
    })

    test('it should validate good BLS mainnet address', async () => {
      expect(
        validateAddressString(
          't3vvmn62lofvhjd2ugzca6sof2j2ubwok6cj4xxbfzz4yuxfkgobpihhd2thlanmsh3w2ptld2gqkn2jvlss4a'
        )
      ).toBe(true)
    })

    test('it should invalidate address with invalid protocol', async () => {
      expect(
        validateAddressString(
          't4vvmn62lofvhjd2ugzca6sof2j2ubwok6cj4xxbfzz4yuxfkgobpihhd2thlanmsh3w2ptld2gqkn2jvlss4a'
        )
      ).toBe(false)
    })

    test('it should invalidate address with invalid network', async () => {
      expect(
        validateAddressString(
          'x3vvmn62lofvhjd2ugzca6sof2j2ubwok6cj4xxbfzz4yuxfkgobpihhd2thlanmsh3w2ptld2gqkn2jvlss4a'
        )
      ).toBe(false)
    })
  })
})
