import { BigNumber } from 'bignumber.js'
import { Converter } from '../Converter'
import { FilecoinNumber } from '../FilecoinNumber'

describe('Converter', () => {
  describe('Setup', () => {
    let converter: Converter
    beforeAll(() => {
      converter = new Converter('USD', {
        apiURL: 'https://cmc-proxy.openworklabs.com'
      })
    })

    test('should return instances of Converter', () => {
      expect(converter instanceof Converter).toBe(true)
    })

    test('should throw an error if toFIL is called before rate is cached', () => {
      expect(() => converter.toFIL(1)).toThrow()
    })

    test('should throw an error if fromFIL is called before rate is cached', () => {
      expect(() => converter.fromFIL(1)).toThrow()
    })

    test('should cache conversion rates', async () => {
      await converter.cacheConversionRate()
      const cachedConversionRate = converter.getCachedConversionRate()
      expect(cachedConversionRate instanceof BigNumber).toBe(true)
      // @ts-ignore
      expect(typeof cachedConversionRate.toNumber()).toBe('number')
    })
  })

  describe('toFIL', () => {
    let converter: Converter
    beforeAll(async () => {
      converter = new Converter('USD', {
        apiURL: 'https://cmc-proxy.openworklabs.com'
      })
      await converter.cacheConversionRate()
    })

    test('throws an error if a type other than BN, Number, or String is passed', () => {
      // @ts-ignore
      expect(() => converter.toFIL({ hello: 'there' })).toThrow()
      // @ts-ignore
      expect(() => converter.toFIL([1])).toThrow()
      // @ts-ignore
      expect(() => converter.toFIL(new Set([1]))).toThrow()
    })

    test('accepts numbers, strings, FilecoinNumbers, and BigNumbers as valid amount vals', () => {
      expect(() => converter.toFIL(1)).not.toThrow()
      expect(() => converter.toFIL('1')).not.toThrow()
      expect(() => converter.toFIL(new BigNumber('1'))).not.toThrow()
      expect(() => converter.toFIL(new FilecoinNumber('1', 'fil')))
    })

    test('Returns an instance of FilecoinNumber', () => {
      const num = converter.toFIL('1')
      expect(num instanceof FilecoinNumber).toBe(true)
    })

    test('Calculates the conversion by dividing the Filecoin amount by the rate', () => {
      const fil = new BigNumber(100)
      const rate = converter.getCachedConversionRate()
      const manuallyCalculatedFilAmount = fil.dividedBy(rate!)
      const filAmount = converter.toFIL(100)
      expect(filAmount.toString()).toBe(manuallyCalculatedFilAmount.toString())
    })
  })

  describe('fromFIL', () => {
    let converter: Converter
    beforeAll(async () => {
      converter = new Converter('USD', {
        apiURL: 'https://cmc-proxy.openworklabs.com'
      })
      await converter.cacheConversionRate()
    })

    test('throws an error if a type other than BN, Number, or String is passed', () => {
      // @ts-ignore
      expect(() => converter.fromFIL({ hello: 'there' })).toThrow()
      // @ts-ignore
      expect(() => converter.fromFIL([1])).toThrow()
      // @ts-ignore
      expect(() => converter.fromFIL(new Set([1]))).toThrow()
    })

    test('accepts numbers, strings, FilecoinNumbers, and BigNumbers as valid amount vals', () => {
      expect(() => converter.fromFIL(1)).not.toThrow()
      expect(() => converter.fromFIL('1')).not.toThrow()
      expect(() => converter.fromFIL(new BigNumber('1'))).not.toThrow()
      expect(() => converter.fromFIL(new FilecoinNumber('1', 'fil')))
    })

    test('Returns an instance of BigNumber', () => {
      const num = converter.fromFIL('1')
      expect(num instanceof BigNumber).toBe(true)
    })

    test('Calculates the conversion by multiplying the Filecoin amount by the rate', () => {
      const fil = new BigNumber(100)
      const rate = converter.getCachedConversionRate()
      const manuallyCalculatedFilAmount = fil.multipliedBy(rate!)
      const filAmount = converter.fromFIL(100)
      expect(filAmount.toString()).toBe(manuallyCalculatedFilAmount.toString())
    })
  })
})
