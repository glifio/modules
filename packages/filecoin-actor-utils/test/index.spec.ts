import { describeFEVMTxParams } from '../src/utils/params'
import { describeFEVMTxReturn } from '../src/utils/return'
import { getFEVMMethodName } from '../src/utils/method'
import { abi } from './erc20ABI'
import { Type } from '../src/types'
import { cborToHex } from '../src/utils/abi'

describe('utils', () => {
  describe('FEVM', () => {
    describe('describeFEVMMessageParams', () => {
      test('it decodes an ERC20 transfer', () => {
        const transferParams =
          'WESpBZy7AAAAAAAAAAAAAAAAqV4VZ+c6Em/FjMB4NX+woThFrgwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN4Lazp2QAAA=='
        const describedParams = describeFEVMTxParams(transferParams, abi)
        expect(describedParams).not.toBeNull()
        expect(describedParams?.Name).toBe('Inputs')
        expect(describedParams?.Type).toBe(Type.Object)

        expect(describedParams?.Children?.['to'].Name).toBe('address')
        expect(describedParams?.Children?.['to'].Type).toBe(Type.String)
        expect(describedParams?.Children?.['to'].Value).toBe(
          '0xA95e1567e73A126FC58cc078357fb0A13845AE0C'
        )

        expect(describedParams?.Children?.['amount'].Name).toBe('uint256')
        expect(describedParams?.Children?.['amount'].Type).toBe(Type.Number)
        expect(describedParams?.Children?.['amount'].Value).toBe(
          '1000000000000000000'
        )
      })
    })

    describe('describeFEVMMessageReturn', () => {
      test('it decodes an ERC20 transfer return', () => {
        const transferParams =
          'WESpBZy7AAAAAAAAAAAAAAAAqV4VZ+c6Em/FjMB4NX+woThFrgwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN4Lazp2QAAA=='
        const returnVal = 'WCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQ=='
        const describedReturn = describeFEVMTxReturn(
          transferParams,
          returnVal,
          abi
        )

        expect(describedReturn).not.toBeNull()
        expect(describedReturn?.Type).toBe(Type.Bool)
        expect(describedReturn?.Name).toBe('bool')
        expect(describedReturn?.Value).toBe(true)
      })
    })

    describe('getFEVMMethodName', () => {
      test('it return the correct ERC20 method name (transfer)', () => {
        const transferParams =
          'WESpBZy7AAAAAAAAAAAAAAAAqV4VZ+c6Em/FjMB4NX+woThFrgwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN4Lazp2QAAA=='
        const name = getFEVMMethodName(transferParams, abi)
        expect(name).toBe('transfer')
      })
    })

    describe('cborToHex', () => {
      test('it correctly decodes a base64 CBOR string to the ethereum hex representation', () => {
        const base64 = 'WESpBZy7AAAAAAAAAAAAAAAA26ZZUz16hecbJB+IemfoJpPCUyUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN4Lazp2QAAA=='
        const ethHex = '0xa9059cbb000000000000000000000000dba659533d7a85e71b241f887a67e82693c253250000000000000000000000000000000000000000000000000de0b6b3a7640000'
        const result = cborToHex(base64)
        expect(result).toBe(ethHex)
      })
    })
  })
})
