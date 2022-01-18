import { BigNumber } from 'bignumber.js'
import { FilecoinNumber } from '../FilecoinNumber'

describe('FilecoinNumber', () => {
  test('should return instances of BigNumber', () => {
    const filecoinNum = new FilecoinNumber('5000000000000000', 'attofil')
    expect(BigNumber.isBigNumber(filecoinNum)).toBe(true)
  })

  test('converts the same number into fil, picofil, and attofil denominations', () => {
    const picoFilecoinNum = new FilecoinNumber('5000000000', 'picofil')
    expect(picoFilecoinNum.toFil()).toBe('0.005')
    expect(picoFilecoinNum.toPicoFil()).toBe('5000000000')
    expect(picoFilecoinNum.toAttoFil()).toBe('5000000000000000')

    const attoFilecoinNum = new FilecoinNumber('5000000000000000', 'attofil')
    expect(attoFilecoinNum.toFil()).toBe('0.005')
    expect(attoFilecoinNum.toPicoFil()).toBe('5000000000')
    expect(attoFilecoinNum.toAttoFil()).toBe('5000000000000000')

    const filecoinNum = new FilecoinNumber('0.005', 'fil')
    expect(filecoinNum.toFil()).toBe('0.005')
    expect(filecoinNum.toPicoFil()).toBe('5000000000')
    expect(filecoinNum.toAttoFil()).toBe('5000000000000000')
  })

  test('throws error if no denom is specified in constructor', () => {
    // @ts-ignore
    expect(() => new FilecoinNumber('0.005')).toThrow()
  })

  test('throws error if no denom is specified in constructor', () => {
    // @ts-ignore
    expect(() => new FilecoinNumber('0.005', 'invalidDenom')).toThrow()
  })

  test('does not use scientific notation', () => {
    const fil = new FilecoinNumber('1000000000000000000000000', 'fil')
    expect(fil.toAttoFil().includes('e')).toBe(false)
  })
})
