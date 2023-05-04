import { BigNumber } from 'bignumber.js'
import BN from 'bn.js'

// not sure how we want to configure rounding for this
BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export type FilecoinDenomination = 'fil' | 'picofil' | 'attofil'
export enum CoinType {
  MAIN = 'f',
  TEST = 't'
}

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
 * @param unit a custom unit to display with formatBalance, defaults to (t)FIL
 */
export class FilecoinNumber extends BigNumber {
  // Static FilecoinNumber(0, 'fil') instances for each CoinType and unit
  private static zeroMap: Record<CoinType, Record<string, FilecoinNumber>> = {
    [CoinType.MAIN]: {},
    [CoinType.TEST]: {}
  }

  // Constructor params
  private readonly _coinType: CoinType
  private readonly _unit: string

  constructor(
    value: BigNumber.Value,
    denom: FilecoinDenomination,
    coinType = CoinType.MAIN,
    unit = 'FIL'
  ) {
    super(toBigNumberValue(value, denom))
    this._coinType = coinType
    this._unit = unit
  }

  /**
   * A static method that checks whether the
   * supplied value is an instance of FilecoinNumber
   */
  static isFilecoinNumber(value: any): value is FilecoinNumber {
    return (
      BigNumber.isBigNumber(value) &&
      'toFil' in value &&
      'toAttoFil' in value &&
      'toPicoFil' in value
    )
  }

  /**
   * Returns a static zero fil instance for the CoinType and unit
   */
  static zero(coinType = CoinType.MAIN, unit = 'FIL'): FilecoinNumber {
    if (this.zeroMap[coinType][unit] === undefined)
      this.zeroMap[coinType][unit] = new FilecoinNumber(
        0,
        'fil',
        coinType,
        unit
      )
    return this.zeroMap[coinType][unit]
  }

  /**
   * Returns the unit derived from constructor params
   */
  get unit(): string {
    const addT = this._coinType === CoinType.TEST && this._unit === 'FIL'
    return `${addT ? 't' : ''}${this._unit}`
  }

  /**
   * Returns the denominator specific unit (omits 't' if adding other prefix)
   */
  getDenomUnit(denom: FilecoinDenomination): string {
    const unitDenom = denom.replace(/fil$/, '')
    return unitDenom ? `${unitDenom}${this._unit}` : this.unit
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
   * Expresses this FilecoinNumber as a CBOR Buffer
   */
  toCBOR(): Buffer {
    if (this.isNaN() || this.isZero()) return Buffer.from([])
    const bn = new BN(this.toAttoFil(), 10)
    const buffer = bn.toArrayLike(Buffer, 'be', bn.byteLength())
    return Buffer.concat([Buffer.from('00', 'hex'), buffer])
  }

  /**
   * Expresses this FilecoinNumber as a balance string
   * @param options.truncate Whether to truncate the address with K, M, B and T units, defaults to `true`. Disabled when `options.decimals` is `null`
   * @param options.decimals How many decimals to display, `null` disables rounding, defaults to `3`
   * @param options.addUnit Whether to display the unit, defaults to `true`
   */
  formatBalance(options?: {
    truncate?: boolean
    decimals?: number | null
    addUnit?: boolean
  }): string {
    const truncate = options?.truncate ?? true
    const round = options?.decimals !== null
    const decimals = options?.decimals ?? 3
    const addUnit = options?.addUnit ?? true

    // Create format configuration
    const format: BigNumber.Format = {
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      suffix: addUnit ? ` ${this.unit}` : ''
    }

    // When not rounding, it doesn't make sense to truncate either.
    // Return the original value when it's zero or when not rounding.
    if (this.isZero() || !round) return this.toFormat(format)

    // Round down by default to avoid showing higher balance
    const rounded = this.dp(decimals, BigNumber.ROUND_DOWN)

    // Value is zero after rounding
    if (rounded.isZero()) {
      const isNegative = this.isNegative()
      if (decimals === 0) {
        // We rounded to 0 decimals, so we show
        // "< 0" for negative and "> 0" for positive values
        const prefix = isNegative ? '< ' : '> '
        return rounded.toFormat({ ...format, prefix })
      } else {
        // We rounded to 1+ decimals, so we show
        // "> -0.01" for negative and "< 0.01" for positive values
        const prefix = isNegative ? '> ' : '< '
        const roundedUp = this.dp(decimals, BigNumber.ROUND_UP)
        return roundedUp.toFormat({ ...format, prefix })
      }
    }

    // Return rounded value between -1000 and 1000 or when not truncating
    const isLt1K = rounded.isGreaterThan(-1000) && rounded.isLessThan(1000)
    if (isLt1K || !truncate) return rounded.toFormat(format)

    // Truncate values below -1000 or above 1000
    let power = 0
    const units = ['K', 'M', 'B', 'T']
    for (const unit of units) {
      const unitRaw = rounded.dividedBy(Math.pow(1000, ++power))
      const unitVal = unitRaw.dp(1, BigNumber.ROUND_DOWN)
      const isLt1K = unitVal.isGreaterThan(-1000) && unitVal.isLessThan(1000)
      if (isLt1K || unit === 'T') {
        const suffix = `${unit}${format.suffix}`
        return unitVal.toFormat({ ...format, suffix })
      }
    }

    // Should never hit here
    throw new Error('Failed to format balance')
  }

  /**
   * Returns a copy of this FilecoinNumber
   */
  clone(): FilecoinNumber {
    return new FilecoinNumber(this, 'fil', this._coinType, this._unit)
  }

  /**
   * Returns an absolute value copy of this FilecoinNumber
   */
  abs(): FilecoinNumber {
    return new FilecoinNumber(super.abs(), 'fil', this._coinType, this._unit)
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
    return new FilecoinNumber(
      super.negated(),
      'fil',
      this._coinType,
      this._unit
    )
  }

  /**
   * Returns a copy of this FilecoinNumber divided by the supplied value n
   */
  div(n: BigNumber.Value): FilecoinNumber {
    return new FilecoinNumber(super.div(n), 'fil', this._coinType, this._unit)
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
    return new FilecoinNumber(super.times(n), 'fil', this._coinType, this._unit)
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
    return new FilecoinNumber(super.plus(n), 'fil', this._coinType, this._unit)
  }

  /**
   * Returns a copy of this FilecoinNumber decreased by the supplied value n
   * @param n Should be a FilecoinNumber to prevent denomination errors
   */
  minus(n: BigNumber.Value | FilecoinNumber): FilecoinNumber {
    if (!FilecoinNumber.isFilecoinNumber(n))
      // tslint:disable-next-line:no-console
      console.warn('FilecoinNumber.minus(n) should be passed a FilecoinNumber')
    return new FilecoinNumber(super.minus(n), 'fil', this._coinType, this._unit)
  }
}
