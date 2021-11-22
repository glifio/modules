import { CoinType } from '@glif/filecoin-address'

const MAINNET_PATH_CODE: CoinTypeCode = 461
const TESTNET_PATH_CODE: CoinTypeCode = 1

type CoinTypeCode = 461 | 1

const createPath = (coinTypeCode: CoinTypeCode, i: number) => {
  if (coinTypeCode !== MAINNET_PATH_CODE && coinTypeCode !== TESTNET_PATH_CODE)
    throw new Error('Invalid cointype code passed')
  return `m/44'/${coinTypeCode}'/0'/0/${i}`
}

export const coinTypeCode = (coinType: CoinType): CoinTypeCode => {
  if (coinType === 't') return 1
  if (coinType === 'f') return 461
  throw new Error('Unrecognized CoinType')
}

export default createPath
