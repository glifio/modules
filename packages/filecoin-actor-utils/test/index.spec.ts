import { networkActorCodeMap } from '../src/data'
import { getActorName, getActorCode } from '../src/utils/code'

describe('utils', () => {

  describe('getActorName', () => {

    test('should find the actor name when given a code and network', () => {
      const code = networkActorCodeMap['mainnet']['multisig']
      expect(getActorName(code, 'mainnet')).toBe('multisig')
    })

    test('should not find the actor name when given the wrong network', () => {
      const code = networkActorCodeMap['mainnet']['multisig']
      expect(getActorName(code, 'calibrationnet')).toBe(null)
    })

    test('should not find the actor name when the code does not exist', () => {
      expect(getActorName('abc123', 'mainnet')).toBe(null)
    })

    test('it decodes v7 actors', () => {
      expect(getActorName('bafkqadtgnfwc6njpnv2wy5djonuwo', 'calibrationnet')).toBe('multisig')
    })
  })

  describe('getActorCode', () => {

    test('should find the actor code when given a name and network', () => {
      const code = networkActorCodeMap['calibrationnet']['multisig']
      expect(getActorCode('multisig', 'calibrationnet')).toBe(code)
    })

    test('should find the mainnet actor code when not providing a network', () => {
      const code = networkActorCodeMap['mainnet']['multisig']
      expect(getActorCode('multisig', 'mainnet')).toBe(code)
    })

    test('should not find the actor code when the actor name does not exist', () => {
      expect(getActorCode('test', 'mainnet')).toBe(null)
    })
  })
})
