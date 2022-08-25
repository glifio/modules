import { networkActorCodeMap } from '../src/data'
import { getActorName } from '../src/utils'

describe('utils', () => {

  describe('getActorCode', () => {

    test('should find the actor name when given a code and network', () => {
      const code = networkActorCodeMap['mainnet']['multisig']
      expect(getActorName(code, 'mainnet')).toBe('multisig')
    })

    test('should not find the actor name when given the wrong network', () => {
      const code = networkActorCodeMap['mainnet']['multisig']
      expect(getActorName(code, 'calibrationnet')).toBe(null)
    })

    test('should find the actor name when not providing a network', () => {
      const code = networkActorCodeMap['mainnet']['multisig']
      expect(getActorName(code)).toBe('multisig')
    })

    test('should not find the actor name when the code does not exist', () => {
      expect(getActorName("abc123")).toBe(null)
    })
  })
})
