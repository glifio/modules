import { FilecoinNumber, BigNumber } from '@glif/filecoin-number'
import { computeGasToBurn } from './computeGasToBurn'

/**
 * formula (some of these variable names might not be the best...):
 * (GasUsed+GasToBurn)*min(BaseFee, FeeCap)+GasLimit*max(0, min(FeeCap-BaseFee, GasPremium)))
 *
 * minBaseFeeFeeCap = min(BaseFee, FeeCap)
 * totalGas = GasUsed+GasToBurn
 * leftSide = totalGas*minBaseFeBigNumber eFeeCap
 *
 * minTip = min(FeeCap-BaseFee, GasPremium)
 * rightSide = gasLimit*max(0, minTip)
 *
 * paidByMessageSender =
 * leftSide + rightSide
 */
export const calcFeePaid = async (
  gasFeeCap: string,
  gasPremium: string,
  gasLimit: number,
  baseFee: string,
  gasUsed: string
): Promise<FilecoinNumber> => {
  const gasFeeCapBN = new BigNumber(gasFeeCap)
  const gasPremiumBN = new BigNumber(gasPremium)
  const gasLimitBN = new BigNumber(gasLimit)
  const baseFeeBN = new BigNumber(baseFee)
  const gasUsedBN = new BigNumber(gasUsed)

  /* compute left side */
  const gasToBurn = computeGasToBurn(gasUsedBN, gasLimitBN)
  const totalGas = gasUsedBN.plus(gasToBurn)
  const minBaseFeeFeeCap = BigNumber.minimum(baseFeeBN, gasFeeCapBN)
  const leftSide = totalGas.times(minBaseFeeFeeCap)

  /* compute right side */
  const minTip = BigNumber.minimum(gasFeeCapBN.minus(baseFeeBN), gasPremiumBN)
  const rightSide = gasLimitBN.times(BigNumber.maximum(0, minTip))

  return new FilecoinNumber(leftSide.plus(rightSide), 'attofil')
}
