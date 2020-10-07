declare module '@glif/filecoin-number' {
  import BigNumber from 'bignumber.js'
  export class FilecoinNumber {
    constructor(amount: number | string | BigNumber, denom: string)
    times: any
  }
}
