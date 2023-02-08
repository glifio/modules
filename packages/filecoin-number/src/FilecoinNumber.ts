import { BigNumber } from 'bignumber.js'

// not sure how we want to configure rounding for this
BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export type FilecoinDenomination = 'fil' | 'picofil' | 'attofil'

function toBigNumberValue(
  value: BigNumber.Value,
  denom: FilecoinDenomination
): BigNumber.Value {
  switch (denom) {
    case 'fil':
      return value
    case 'picofil':
      return new BigNumber(value).shiftedBy(-12)
    case 'attofil':
      return new BigNumber(value).shiftedBy(-18)
    default:
      throw new Error(
        `Unsupported denomination passed to FilecoinNumber constructor: ${denom}. Must be fil, picofil or attofil.`
      )
  }
}

/**
 * FilecoinNumber is a BigNumber specialization that
 * stores Filecoin values in denominations of Fil.
 * @param value The value to store as FIL
 * @param denom The denomination of value (fil, picofil or attofil)
 */
export class FilecoinNumber extends BigNumber {
  constructor(value: BigNumber.Value, denom: FilecoinDenomination) {
    super(toBigNumberValue(value, denom))
  }

  /**
   * A static method that checks whether the
   * supplied value is an instance of FilecoinNumber
   */
  static isFilecoinNumber(value: any): boolean {
    return (
      BigNumber.isBigNumber(value) &&
      'toFil' in value &&
      'toAttoFil' in value &&
      'toPicoFil' in value
    )
  }

  /**
   * Expresses this FilecoinNumber as a FIL string
   */
  toFil(): string {
    return this.toString()
  }

  /**
   * Expresses this FilecoinNumber as a PicoFIL string
   */
  toPicoFil(): string {
    return this.shiftedBy(12).toString()
  }

  /**
   * Expresses this FilecoinNumber as an AttoFIL string
   */
  toAttoFil(): string {
    return this.shiftedBy(18).toFixed(0, BigNumber.ROUND_DOWN)
  }

  /**
   * Expresses this FilecoinNumber as a balance string
   */
  formatBalance(decimals = 3, addUnit = true): string {
    if (decimals < 0) throw new Error('Decimals must be >= 0')
    if (this.isNaN()) throw new Error('Value cannot be NaN')

    const format: BigNumber.Format = {
      decimalSeparator: '.',
      groupSeparator: ' ',
      groupSize: 3,
      suffix: addUnit ? ' FIL' : ''
    }

    // Base value is zero
    if (this.isZero()) return this.toFormat(format)

    const isNegative = this.isNegative()
    const dpValue = this.dp(decimals, BigNumber.ROUND_DOWN)
    const dpUpValue = this.dp(decimals, BigNumber.ROUND_UP)

    // Zero after stripping decimals
    if (dpValue.isZero())
      return decimals === 0
        ? dpValue.toFormat({ ...format, prefix: isNegative ? '< ' : '> ' })
        : dpUpValue.toFormat({ ...format, prefix: isNegative ? '> ' : '< ' })

    // Stripped value is between -1000 and 1000
    if (dpValue.isGreaterThan(-1000) && dpValue.isLessThan(1000))
      return dpValue.toFormat(format)

    // from thousands to trillions
    let power = 0
    const units = ['K', 'M', 'B', 'T']
    for (const unit of units) {
      const unitVal = dpValue.dividedBy(Math.pow(1000, ++power))
      const unitDpVal = unitVal.dp(3, BigNumber.ROUND_DOWN)
      if (
        (unitDpVal.isGreaterThan(-1000) && unitDpVal.isLessThan(1000)) ||
        unit === 'T'
      )
        return unitDpVal.toFormat({
          ...format,
          suffix: `${unit}${format.suffix}`
        })
    }

    // Should never hit here
    throw new Error('Failed to format balance')
  }

  /**
   * Returns a copy of this FilecoinNumber
   */
  clone(): FilecoinNumber {
    return new FilecoinNumber(this, 'fil')
  }

  /**
   * Returns an absolute value copy of this FilecoinNumber
   */
  abs(): FilecoinNumber {
    return new FilecoinNumber(super.abs(), 'fil')
  }

  /**
   * Returns an absolute value copy of this FilecoinNumber
   */
  absoluteValue(): FilecoinNumber {
    return this.abs()
  }

  /**
   * Returns a negated copy of this FilecoinNumber (multiplied by -1)
   */
  negated(): FilecoinNumber {
    return new FilecoinNumber(super.negated(), 'fil')
  }

  /**
   * Returns a copy of this FilecoinNumber divided by the supplied value n
   */
  div(n: BigNumber.Value): FilecoinNumber {
    return new FilecoinNumber(super.div(n), 'fil')
  }

  /**
   * Returns a copy of this FilecoinNumber divided by the supplied value n
   */
  dividedBy(n: BigNumber.Value): FilecoinNumber {
    return this.div(n)
  }

  /**
   * Returns a copy of this FilecoinNumber multiplied by the supplied value n
   */
  times(n: BigNumber.Value): FilecoinNumber {
    return new FilecoinNumber(super.times(n), 'fil')
  }

  /**
   * Returns a copy of this FilecoinNumber multiplied by the supplied value n
   */
  multipliedBy(n: BigNumber.Value): FilecoinNumber {
    return this.times(n)
  }

  /**
   * Returns a copy of this FilecoinNumber increased by the supplied value n
   * @param n Should be a FilecoinNumber to prevent denomination errors
   */
  plus(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    if (!FilecoinNumber.isFilecoinNumber(n))
      // tslint:disable-next-line:no-console
      console.warn('FilecoinNumber.plus(n) should be passed a FilecoinNumber')
    return new FilecoinNumber(super.plus(n), 'fil')
  }

  /**
   * Returns a copy of this FilecoinNumber decreased by the supplied value n
   * @param n Should be a FilecoinNumber to prevent denomination errors
   */
  minus(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    if (!FilecoinNumber.isFilecoinNumber(n))
      // tslint:disable-next-line:no-console
      console.warn('FilecoinNumber.minus(n) should be passed a FilecoinNumber')
    return new FilecoinNumber(super.minus(n), 'fil')
  }
}
