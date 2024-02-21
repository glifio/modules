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

/**
 * @param options.truncate Whether to truncate the address with K, M, B and T units, defaults to `true`. Disabled when `options.decimals` is `null`
 * @param options.decimals How many decimals to display, `null` disables rounding, defaults to `3`
 * @param options.padZeros Whether add trailing zeros to the end of the string, defaults to `false`
 * @param options.addUnit Whether to display the unit, defaults to `true`
 * @param options.prefix The prefix to prepend to the formatted string
 */
export interface FilecoinFormatOptions {
  truncate?: boolean
  decimals?: number | null
  padZeros?: boolean
  addUnit?: boolean
  prefix?: string
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
 * @param unit a custom unit to display with formatBalance, defaults to FIL
 */
export class FilecoinNumber extends BigNumber {
  public static readonly DefaultUnit: string = 'FIL'

  // Static FilecoinNumber(0, 'fil') instances for each CoinType and unit
  private static zeroMap: Record<CoinType, Record<string, FilecoinNumber>> = {
    [CoinType.MAIN]: {},
    [CoinType.TEST]: {}
  }

  // Constructor params
  public readonly coinType: CoinType
  public readonly unit: string

  constructor(
    value: BigNumber.Value,
    denom: FilecoinDenomination,
    coinType = CoinType.MAIN,
    unit = FilecoinNumber.DefaultUnit
  ) {
    super(toBigNumberValue(value, denom))
    this.coinType = coinType
    this.unit = unit
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
  static zero(
    coinType = CoinType.MAIN,
    unit = FilecoinNumber.DefaultUnit
  ): FilecoinNumber {
    if (this.zeroMap[coinType][unit] === undefined)
      this.zeroMap[coinType][unit] = new FilecoinNumber(
        0,
        'fil',
        coinType,
        unit
      )
    return this.zeroMap[coinType][unit]
  }

  static min(...n: FilecoinNumber[]): FilecoinNumber {
    return new FilecoinNumber(
      super.min.apply(null, n),
      'fil',
      n[0].coinType,
      n[0].unit
    )
  }

  static max(...n: FilecoinNumber[]): FilecoinNumber {
    return new FilecoinNumber(
      super.max.apply(null, n),
      'fil',
      n[0].coinType,
      n[0].unit
    )
  }

  static minimum(...n: FilecoinNumber[]): FilecoinNumber {
    return this.min.apply(null, n)
  }

  static maximum(...n: FilecoinNumber[]): FilecoinNumber {
    return this.max.apply(null, n)
  }

  /**
   * Returns the unit with a 't' prefix for testnets
   */
  get displayUnit(): string {
    const addT =
      this.coinType === CoinType.TEST &&
      this.unit === FilecoinNumber.DefaultUnit
    return `${addT ? 't' : ''}${this.unit}`
  }

  /**
   * Checks whether the unit is the default unit
   */
  get isDefaultUnit(): boolean {
    return this.unit === FilecoinNumber.DefaultUnit
  }

  /**
   * Returns the denominator specific unit (omits 't' if adding other prefix)
   */
  getDenomUnit(denom: FilecoinDenomination): string {
    const unitDenom = denom.replace(/fil$/, '')
    return unitDenom ? `${unitDenom}${this.unit}` : this.displayUnit
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
   * Expresses this FilecoinNumber as a formatted AttoFIL string
   */
  formatAttoFil(
    options?: Pick<FilecoinFormatOptions, 'addUnit' | 'prefix'>
  ): string {
    const addUnit = options?.addUnit ?? true
    return this.shiftedBy(18).toFormat(0, BigNumber.ROUND_DOWN, {
      groupSeparator: ',',
      groupSize: 3,
      suffix: addUnit ? ` ${this.getDenomUnit('attofil')}` : '',
      prefix: options?.prefix ?? ''
    })
  }

  /**
   * Expresses this FilecoinNumber as a balance string
   */
  formatBalance(options?: FilecoinFormatOptions): string {
    const truncate = options?.truncate ?? true
    const round = options?.decimals !== null
    const decimals = options?.decimals ?? 3
    const padZeros = options?.padZeros ?? false
    const addUnit = options?.addUnit ?? true

    const toFormat = (value: BigNumber, format: BigNumber.Format): string =>
      padZeros
        ? value.toFormat(decimals, BigNumber.ROUND_DOWN, format)
        : value.toFormat(format)

    // Create format configuration
    const format: BigNumber.Format = {
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      suffix: addUnit ? ` ${this.displayUnit}` : '',
      prefix: options?.prefix ?? ''
    }

    // When not rounding, it doesn't make sense to truncate either.
    // Return the original value when it's zero or when not rounding.
    if (this.isZero() || !round) return toFormat(this, format)

    // Round down by default to avoid showing higher balance
    const rounded = this.dp(decimals, BigNumber.ROUND_DOWN)

    // Value is zero after rounding
    if (rounded.isZero()) {
      const isNegative = this.isNegative()
      if (decimals === 0) {
        // We rounded to 0 decimals, so we show
        // "< 0" for negative and "> 0" for positive values
        const prefix = `${isNegative ? '<' : '>'} ${format.prefix}`
        return toFormat(rounded, { ...format, prefix })
      } else {
        // We rounded to 1+ decimals, so we show
        // "> -0.01" for negative and "< 0.01" for positive values
        const prefix = `${isNegative ? '>' : '<'} ${format.prefix}`
        const roundedUp = this.dp(decimals, BigNumber.ROUND_UP)
        return toFormat(roundedUp, { ...format, prefix })
      }
    }

    // Return rounded value between -1000 and 1000 or when not truncating
    const isLt1K = rounded.isGreaterThan(-1000) && rounded.isLessThan(1000)
    if (isLt1K || !truncate) return toFormat(rounded, format)

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
    return new FilecoinNumber(this, 'fil', this.coinType, this.unit)
  }

  /**
   * Returns an copy of this FilecoinNumber that is rounded up
   */
  roundUp(decimalPlaces = 0): FilecoinNumber {
    const bigNr = super.dp(decimalPlaces, BigNumber.ROUND_UP)
    return new FilecoinNumber(bigNr, 'fil', this.coinType, this.unit)
  }

  /**
   * Returns an copy of this FilecoinNumber that is rounded down
   */
  roundDown(decimalPlaces = 0): FilecoinNumber {
    const bigNr = super.dp(decimalPlaces, BigNumber.ROUND_DOWN)
    return new FilecoinNumber(bigNr, 'fil', this.coinType, this.unit)
  }

  /**
   * Returns an absolute value copy of this FilecoinNumber
   */
  abs(): FilecoinNumber {
    return new FilecoinNumber(super.abs(), 'fil', this.coinType, this.unit)
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
    return new FilecoinNumber(super.negated(), 'fil', this.coinType, this.unit)
  }

  /**
   * Returns a copy of this FilecoinNumber divided by the supplied value n
   */
  div(n: BigNumber.Value): FilecoinNumber {
    return new FilecoinNumber(super.div(n), 'fil', this.coinType, this.unit)
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
    return new FilecoinNumber(super.times(n), 'fil', this.coinType, this.unit)
  }

  /**
   * Returns a copy of this FilecoinNumber multiplied by the supplied value n
   */
  multipliedBy(n: BigNumber.Value): FilecoinNumber {
    return this.times(n)
  }

  /**
   * Returns a copy of this FilecoinNumber increased by the supplied value n
   * @param n Must be a FilecoinNumber to prevent denomination errors
   */
  plus(n: FilecoinNumber): FilecoinNumber {
    return new FilecoinNumber(super.plus(n), 'fil', this.coinType, this.unit)
  }

  /**
   * Returns a copy of this FilecoinNumber decreased by the supplied value n
   * @param n Must be a FilecoinNumber to prevent denomination errors
   */
  minus(n: FilecoinNumber): FilecoinNumber {
    return new FilecoinNumber(super.minus(n), 'fil', this.coinType, this.unit)
  }

  /**
   * Returns `true` if the value of this BigNumber is equal to the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  eq(n: FilecoinNumber | 0): boolean {
    return super.eq(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is greater than the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  gt(n: FilecoinNumber | 0): boolean {
    return super.gt(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is greater than or equal to the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  gte(n: FilecoinNumber | 0): boolean {
    return super.gte(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is less than the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  lt(n: FilecoinNumber | 0): boolean {
    return super.lt(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is less than or equal to the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  lte(n: FilecoinNumber | 0): boolean {
    return super.lte(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is equal to the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  isEqualTo(n: FilecoinNumber | 0): boolean {
    return super.isEqualTo(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is greater than the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  isGreaterThan(n: FilecoinNumber | 0): boolean {
    return super.isGreaterThan(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is greater than or equal to the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  isGreaterThanOrEqualTo(n: FilecoinNumber | 0): boolean {
    return super.isGreaterThanOrEqualTo(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is less than the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  isLessThan(n: FilecoinNumber | 0): boolean {
    return super.isLessThan(n)
  }

  /**
   * Returns `true` if the value of this BigNumber is less than or equal to the value of `n`, otherwise returns `false`.
   * @param n Must be a FilecoinNumber or 0 to prevent denomination errors
   */
  isLessThanOrEqualTo(n: FilecoinNumber | 0): boolean {
    return super.isLessThanOrEqualTo(n)
  }
}
