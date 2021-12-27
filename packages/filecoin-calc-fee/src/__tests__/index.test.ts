import { BigNumber } from '@glif/filecoin-number'
import { calcFeePaid } from '..'
import { computeGasToBurn } from '../computeGasToBurn'

describe('calcFeePaid', () => {
  test('it returns a FilecoinNumber representing the transaction fee paid by the sender', async () => {
    const gasUsed = '435268'
    const gasLimit = 541585
    const baseFee = '957893300'
    const gasFeeCap = '10076485367'
    const gasPremium = '136364'

    const fee = await calcFeePaid(
      gasFeeCap,
      gasPremium,
      gasLimit,
      baseFee,
      gasUsed
    )

    expect(fee.toAttoFil()).toBe('431705363143440')
  })

  test('it returns a FilecoinNumber representing the transaction fee paid by the sender (2)', async () => {
    const gasUsed = '8092030'
    const gasLimit = 10115037
    const baseFee = '100'
    const gasFeeCap = '150825'
    const gasPremium = '149771'

    const fee = await calcFeePaid(
      gasFeeCap,
      gasPremium,
      gasLimit,
      baseFee,
      gasUsed
    )

    expect(fee.toAttoFil()).toBe('1515778754527')
  })

  test('it returns a FilecoinNumber representing the transaction fee paid by the sender (3)', async () => {
    const gasUsed = '44955257'
    const gasLimit = 55745321
    const baseFee = '1089215916'
    const gasFeeCap = '896936264'
    const gasPremium = '116155'

    const fee = await calcFeePaid(
      gasFeeCap,
      gasPremium,
      gasLimit,
      baseFee,
      gasUsed
    )

    expect(fee.toAttoFil()).toBe('41677092465327312')
  })
})

describe('computeGasToBurn', () => {
  test('it computes the overestimation burn', () => {
    const gasLimit = 541585
    const gasUsed = 435268
    expect(
      computeGasToBurn(
        new BigNumber(gasUsed),
        new BigNumber(gasLimit)
      ).toString()
    ).toBe('15337')
  })

  test('it computes the overestimation burn (2)', () => {
    const gasUsed = 8092030
    const gasLimit = 10115037
    expect(
      computeGasToBurn(
        new BigNumber(gasUsed),
        new BigNumber(gasLimit)
      ).toString()
    ).toBe('303450')
  })

  test('it computes the overestimation burn (3)', () => {
    const gasUsed = 44955257
    const gasLimit = 55745321
    expect(
      computeGasToBurn(
        new BigNumber(gasUsed),
        new BigNumber(gasLimit)
      ).toString()
    ).toBe('1510801')
  })
})
