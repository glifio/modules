import * as uint8arrays from 'uint8arrays'
import { blake2b } from 'blakejs'
import {
  actorAddresses,
  BLSAddresses,
  IDAddresses,
  secp256k1Addresses
} from './constants'
import {
  encode,
  decode,
  newFromString,
  validateAddressString,
  newIDAddress,
  CoinType,
  Address,
  newActorAddress,
  newSecp256k1Address,
  newBLSAddress,
  idFromAddress,
  _delegatedFromEthHex
} from '../index'

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
  describe('newActorAddress', () => {
    test('it should create new Actor address', () => {
      const data = uint8arrays.fromString('actor')
      const address = newActorAddress(data)
      expect(
        uint8arrays.equals(address.payload(), blake2b(data, null, 20))
      ).toBe(true)
    })
  })
  describe('newSecp256k1Address', () => {
    test('it should create new Secp256k1 address', () => {
      const data = uint8arrays.fromString('Secp256k1 pubkey')
      const address = newSecp256k1Address(data)
      expect(
        uint8arrays.equals(address.payload(), blake2b(data, null, 20))
      ).toBe(true)
    })
  })
  describe('newBLSAddress', () => {
    test('it should create new BLS address', () => {
      const data = uint8arrays.fromString('BLS pubkey')
      const address = newBLSAddress(data)
      expect(uint8arrays.equals(address.payload(), data)).toBe(true)
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

  describe('idFromAddress', () => {
    test('it should extract the ID from an ID address', () => {
      const id = 1138
      const address = newIDAddress(id)
      expect(idFromAddress(address)).toBe(id)
    })

    test('it should extract ID from address with the max ID value', () => {
      const id = Math.pow(2, 63)
      const address = newIDAddress(`${id}`)
      expect(idFromAddress(address)).toBe(id)
    })

    test('it should throw when given a non-ID address', () => {
      const address = new Address(secp256k1Addresses[0].decodedByteArray)
      expect(() => idFromAddress(address)).toThrow(
        'Cannot get ID from non ID address'
      )
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
    test('it should preserve testnet coinType', () => {
      const addressStr = `${CoinType.TEST}${IDAddresses[0].string.slice(1)}`
      const address = decode(addressStr)
      expect(address.coinType()).toBe(CoinType.TEST)
      expect(address.toString()).toBe(addressStr)
    })

    test('it should preserve mainnet network', () => {
      const addressStr = `${CoinType.MAIN}${IDAddresses[0].string.slice(1)}`
      const address = decode(addressStr)
      expect(address.coinType()).toBe(CoinType.MAIN)
      expect(address.toString()).toBe(addressStr)
    })
  })

  describe('toString', () => {
    test('it should stringify ID addresses', () => {
      IDAddresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, CoinType.TEST)
        expect(`${tAddr}`).toBe(`${CoinType.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, CoinType.MAIN)
        expect(`${fAddr}`).toBe(`${CoinType.MAIN}${item.string.slice(1)}`)
      })
    })

    test('it should stringify secp256k1 addresses', () => {
      secp256k1Addresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, CoinType.TEST)
        expect(`${tAddr}`).toBe(`${CoinType.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, CoinType.MAIN)
        expect(`${fAddr}`).toBe(`${CoinType.MAIN}${item.string.slice(1)}`)
      })
    })

    test('it should stringify BLS addresses', () => {
      BLSAddresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, CoinType.TEST)
        expect(`${tAddr}`).toBe(`${CoinType.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, CoinType.MAIN)
        expect(`${fAddr}`).toBe(`${CoinType.MAIN}${item.string.slice(1)}`)
      })
    })

    test('it should stringify Actor addresses', () => {
      actorAddresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, CoinType.TEST)
        expect(`${tAddr}`).toBe(`${CoinType.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, CoinType.MAIN)
        expect(`${fAddr}`).toBe(`${CoinType.MAIN}${item.string.slice(1)}`)
      })
    })

    test('it should stringify Delegated addresses', () => {
      actorAddresses.forEach(item => {
        const tAddr = new Address(item.decodedByteArray, CoinType.TEST)
        expect(`${tAddr}`).toBe(`${CoinType.TEST}${item.string.slice(1)}`)
        const fAddr = new Address(item.decodedByteArray, CoinType.MAIN)
        expect(`${fAddr}`).toBe(`${CoinType.MAIN}${item.string.slice(1)}`)
      })
    })
  })

  describe('equals', () => {
    test('it should be equal if it is the same instance', () => {
      const address = new Address(IDAddresses[0].decodedByteArray)
      expect(address === address).toBe(true)
      expect(address.equals(address)).toBe(true)
    })

    test('it should be equal if they have the same value', () => {
      const address0 = new Address(IDAddresses[0].decodedByteArray)
      const address1 = new Address(IDAddresses[0].decodedByteArray)
      expect(address0 === address1).toBe(false)
      expect(address0.equals(address1)).toBe(true)
    })

    test('it should not be equal if they do not have the same value', () => {
      const address0 = new Address(IDAddresses[0].decodedByteArray)
      const address1 = new Address(IDAddresses[1].decodedByteArray)
      expect(address0 === address1).toBe(false)
      expect(address0.equals(address1)).toBe(false)
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

    test('it should invalidate ID address with letters', async () => {
      expect(validateAddressString('t078fdsafd')).toBe(false)
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

  describe('_delegatedFromEthHex', () => {
    expect(
      _delegatedFromEthHex(
        '0x33a96ff53945374ce14853bc370999b38a899026',
        CoinType.TEST
      )
    ).toBe(
      't410fgb4dgm3bhe3gmzrvgm4tinjtg42ggzjrgq4dkm3cmmztombzhe4wemzyme4dsojqgi3chkxqgm'
    )

    expect(
      _delegatedFromEthHex(
        '0x200e5333054ff745df86083a5b73fa44d496244a',
        CoinType.TEST
      )
    ).toBe(
      't410fgb4dembqmu2tgmztga2tiztgg42dkzdgha3daobtme2wenztmzqtindegq4tmmrugrqylntvte'
    )
  })
})
