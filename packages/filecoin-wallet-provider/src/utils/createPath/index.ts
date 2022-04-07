/* tslint:disable no-shadowed-variable */
import { CoinType } from '@glif/filecoin-address'
export { default as validatePath } from './validatePath'

export type CoinTypeCode = 461 | 1

const MAINNET_PATH_CODE: CoinTypeCode = 461
const TESTNET_PATH_CODE: CoinTypeCode = 1

export const createPath = (coinTypeCode: CoinTypeCode, i: number) => {
  if (coinTypeCode !== MAINNET_PATH_CODE && coinTypeCode !== TESTNET_PATH_CODE)
    throw new Error('Invalid cointype code passed')
  return `m/44'/${coinTypeCode}'/0'/0/${i}`
}

export const extractCoinTypeFromPath = (path: string): CoinType => {
  const [, , coinType, , ,] = path.split('/')
  const bip44Code = coinType.replace("'", '')

  if (Number(bip44Code) === 1) return CoinType.TEST
  if (Number(bip44Code) === 461) return CoinType.MAIN

  throw new Error('Invalid path passed')
}

export const coinTypeCode = (coinType: CoinType): CoinTypeCode => {
  if (coinType === 't') return 1
  if (coinType === 'f') return 461
  throw new Error('Unrecognized CoinType')
}
