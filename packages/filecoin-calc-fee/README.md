# `@glif/filecoin-calc-fee`

> For calculating the fee paid for executing a particular Filecoin message

## Usage

```
import { calcFeePaid } from '@glif/filecoin-calc-fee';

const feePaid = await calcFeePaid(
  gasFeeCap: string,
  gasPremium: string,
  gasLimit: number,
  baseFee: string,
  gasUsed: string
)

const feePaidInFil = feePaid.toFil()
```
