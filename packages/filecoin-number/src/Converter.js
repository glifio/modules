const bent = require('bent')
const BigNumber = require('bignumber.js')
const FilecoinNumber = require('./FilecoinNumber')

class Converter {
  constructor(currency, { apiKey, apiURL }) {
    if (!currency) throw new Error('No currency passed.')
    this.currency = currency
    this.apiKey = apiKey || ''
    this.apiURL = apiURL || 'https://pro-api.coinmarketcap.com/'
    this.rate = null
  }

  cacheConversionRate = async () => {
    this.rate = new BigNumber(await this.convert(1, 'FIL', this.currency))
  }

  toFIL = amount => {
    if (!amount) return this.toFIL('0')
    if (!this.rate) {
      throw new Error(
        'Call cacheConversionRate() to get the conversion rate before calling .toFIL.',
      )
    }
    if (
      typeof amount === 'string' ||
      typeof amount === 'number' ||
      amount instanceof BigNumber
    ) {
      const filAmount = new BigNumber(amount).dividedBy(this.rate)
      return new FilecoinNumber(filAmount, 'fil')
    }

    throw new Error(
      'Amount passed must be a Number, String, or an instanceof BigNumber',
    )
  }

  fromFIL = amount => {
    if (!amount) return this.fromFIL('0')
    if (!this.rate)
      throw new Error(
        'Call cacheConversionRate() to get the conversion rate before calling .fromFIL.',
      )

    if (
      typeof amount === 'string' ||
      typeof amount === 'number' ||
      amount instanceof BigNumber
    ) {
      return new BigNumber(amount).multipliedBy(this.rate)
    }

    throw new Error(
      'Amount passed must be a Number, String, or an instanceof BigNumber.',
    )
  }

  convert = async (amount, from, to) => {
    const get = bent('GET', 'json', {
      'X-CMC_PRO_API_KEY': this.apiKey,
    })

    const res = await get(
      `${this.apiURL}/v1/tools/price-conversion?symbol=${from}&amount=${amount}&convert=${to}`,
    )

    if (!res.data || !res.data.quote || !res.data.quote[to])
      throw new Error('No conversion price found.')

    return res.data.quote[to].price
  }

  getCachedConversionRate = () => this.rate
}

module.exports = Converter
