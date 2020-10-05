const BigNumber = require('bignumber.js')

// not sure how we want to configure rounding for this
BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

// stores filecoin numbers in denominations of Fil, not AttoFil
class FilecoinNumber extends BigNumber {
  constructor(amount, denom) {
    if (!denom)
      throw new Error('No Filecoin denomination passed in constructor.')
    const formattedDenom = denom.toLowerCase()
    if (
      formattedDenom !== 'fil' &&
      formattedDenom !== 'picofil' &&
      formattedDenom !== 'attofil'
    )
      throw new Error(
        'Unsupported denomination passed in constructor. Must pass picofil or attofil.',
      )
    if (formattedDenom === 'picofil') {
      super(new BigNumber(amount).shiftedBy(-12))
    } else if (formattedDenom === 'attofil') {
      super(new BigNumber(amount).shiftedBy(-18))
    } else {
      super(amount)
    }
  }

  toFil = () => this.toString()
  toPicoFil = () => this.shiftedBy(12).toString()
  toAttoFil = () => this.shiftedBy(18).toFixed(0, 1)
}

module.exports = FilecoinNumber
