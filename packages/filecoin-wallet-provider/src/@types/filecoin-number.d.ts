declare module '@glif/filecoin-number' {
  import BigNumber from 'bignumber.js'
  export { BigNumber }
  export class FilecoinNumber extends BigNumber {
    constructor(amount: number | string | BigNumber, denom: string)
    toAttoFil(): string
  }
}
