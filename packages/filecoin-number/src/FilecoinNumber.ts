import { BigNumber } from 'bignumber.js'

// not sure how we want to configure rounding for this
BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

type FilecoinDenomination = 'fil'|'picofil'|'attofil';

function asBigNumber(amount: BigNumber.Value, denom: FilecoinDenomination) {
  if (!denom) {
    throw new Error('No Filecoin denomination passed in constructor.')
  }

  const formattedDenom = denom.toLowerCase()
  if (
    formattedDenom !== 'fil' &&
    formattedDenom !== 'picofil' &&
    formattedDenom !== 'attofil'
  ) {
    throw new Error(
      'Unsupported denomination passed in constructor. Must pass picofil or attofil.'
    )
  }

  if (formattedDenom === 'picofil') {
    return new BigNumber(amount).shiftedBy(-12)
  } else if (formattedDenom === 'attofil') {
    return new BigNumber(amount).shiftedBy(-18)
  } else {
    return amount
  }
}

// stores filecoin numbers in denominations of Fil, not AttoFil
export class FilecoinNumber extends BigNumber {
  constructor(amount: BigNumber.Value, denom: FilecoinDenomination) {
    super(asBigNumber(amount, denom))
  }

  /**
   * A static method that checks whether the
   * supplied value is an instance of FilecoinNumber
   */
  static isFilecoinNumber(value: any): boolean {
    return BigNumber.isBigNumber(value) &&
      'toFil' in value &&
      'toAttoFil' in value &&
      'toPicoFil' in value
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
  div(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    return new FilecoinNumber(super.div(n), 'fil')
  }

  /**
   * Returns a copy of this FilecoinNumber divided by the supplied value n
   */
  dividedBy(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    return this.div(n)
  }

  /**
   * Returns a copy of this FilecoinNumber multiplied by the supplied value n
   */
  times(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    return new FilecoinNumber(super.times(n), 'fil')
  }

  /**
   * Returns a copy of this FilecoinNumber multiplied by the supplied value n
   */
  multipliedBy(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    return this.times(n)
  }

  /**
   * Returns a copy of this FilecoinNumber increased by the supplied value n
   * @param n Should be a FilecoinNumber to prevent denomination errors
   */
  plus(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    if (!FilecoinNumber.isFilecoinNumber(n))
      console.warn('FilecoinNumber.plus(n) should be passed a FilecoinNumber')
    return new FilecoinNumber(super.plus(n), 'fil')
  }

  /**
   * Returns a copy of this FilecoinNumber decreased by the supplied value n
   * @param n Should be a FilecoinNumber to prevent denomination errors
   */
  minus(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    if (!FilecoinNumber.isFilecoinNumber(n))
      console.warn('FilecoinNumber.minus(n) should be passed a FilecoinNumber')
    return new FilecoinNumber(super.minus(n), 'fil')
  }
}
