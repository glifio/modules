# Filecoin number

A wrapper class built around javascript's [bignumber](https://github.com/MikeMcl/bignumber.js). Most questions are best answered from the bignumber readme and docs.

## FilecoinNumber Usage

```js
import { FilecoinNumber, Converter } from '@glif/filecoin-number'

// pass a valid bignumber argument, and a denomination ('fil', 'picofil', or 'attofil') to the constructor.
const filecoinNumber = new FilecoinNumber('10000', 'attofil')

// filecoinNumber is an instance of BigNumber, so you can use it as such
filecoinNumber.multiply(7)

// it comes with 2 additional instance methods for showing the filecoin number as a string in attofil or fil
const inPicoFil = filecoinNumber.toPicoFil()
const inAttoFil = filecoinNumber.toAttoFil()
const inFil = filecoinNumber.toFil()
```

## Converter Usage

```js
// Use the Converter to convert currencies
const optionalConfig = {
  apiURL: 'https://coinmarketproxy.com',
  apiKey: 'RIP Kobe',
}

const USDConverter = new Converter('USD', optionalConfig)

await USDConverter.cacheConversionRate()

const USD = USDConverter.fromFIL(1)
const FIL = USDConverter.toFIL(1)

// fromFIL and toFIL take numbers, strings, BigNumbers, and FilecoinNumbers as valid args
const USD = USDConverter.fromFIL(1)
const USD = USDConverter.fromFIL('1')
const USD = USDConverter.fromFIL(new BigNumber(1))
const USD = USDConverter.fromFIL(new FilecoinNumber('1', 'fil'))
```

## Running tests locally

We use an APIADDR environment variable in the tests. You can either:
(a) add the APIADDR environment variable locally, or
(b) use a secrets.js file to export private information
