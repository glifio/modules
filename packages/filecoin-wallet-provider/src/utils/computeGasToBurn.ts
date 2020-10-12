import BigNumber from 'bignumber.js'

const gasOveruseNum = 11
const gasOveruseDenom = 10

export default (gasUsed: BigNumber, gasLimit: BigNumber): BigNumber => {
  const gasUsedBN = new BigNumber(gasUsed)
  const gasLimitBN = new BigNumber(gasLimit)
  if (gasUsedBN.isZero()) {
    return gasLimitBN
  }

  // over = gasLimit/gasUsed - 1 - 0.1
  // over = min(over, 1)
  // gasToBurn = (gasLimit - gasUsed) * over

  // so to factor out division from `over`
  // over*gasUsed = min(gasLimit - (11*gasUsed)/10, gasUsed)
  // gasToBurn = ((gasLimit - gasUsed)*over*gasUsed) / gasUsed
  const overuse = gasUsedBN
    .times(gasOveruseNum)
    .dividedToIntegerBy(gasOveruseDenom)
  let over = gasLimit.minus(overuse)

  if (over.isLessThan(0)) {
    return new BigNumber(0)
  }

  if (over.isGreaterThan(gasUsedBN)) {
    over = gasUsedBN
  }

  let gasToBurn = gasLimit.minus(gasUsedBN)
  gasToBurn = gasToBurn.times(over)
  gasToBurn = gasToBurn.dividedToIntegerBy(gasUsedBN)

  return new BigNumber(gasToBurn.toFixed(0, 4))
}
