import { BigNumber } from 'bignumber.js'

// not sure how we want to configure rounding for this
BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

function asBigNumber(amount: string | number | BigNumber, denom: string) {
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
  constructor(amount: string | number | BigNumber, denom: string) {
    super(asBigNumber(amount, denom))
  }

  toFil() {
    return this.toString()
  }

  toPicoFil() {
    return this.shiftedBy(12).toString()
  }

  toAttoFil() {
    return this.shiftedBy(18).toFixed(0, 1)
  }
}
