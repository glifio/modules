import { FilecoinNumber } from '@glif/filecoin-number'

// returns true if stringNum1 > stringNum2, otherwise returns false
export function num1GreaterThanNum2(
  stringNum1: string | number | FilecoinNumber,
  stringNum2: string | number | FilecoinNumber,
) {
  const bn1 = new FilecoinNumber(stringNum1, 'fil')
  const bn2 = new FilecoinNumber(stringNum2, 'fil')

  return bn1.isGreaterThan(bn2)
}
