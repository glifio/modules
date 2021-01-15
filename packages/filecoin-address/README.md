# filecoin-address

This is a JS implementation of the Filecoin address type, inspired by [go-address](https://github.com/filecoin-project/go-address). It can create new address instances and encode addresses, and it takes care of decoding and validating checksums.

## Install

`npm i @glif/filecoin-address`

## Usage

```js
const { newFromString, encode } = require('@glif/filecoin-address')

const address = newFromString('t1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei')
const addressProtocol = address.protocol()
const addressPayload = address.payload()
const addressString = address.str // Uint8Array

const networkPrefix = 't'
const encoded = encode(networkPrefix, address)
```

#### Exported methods

- newAddress
- newIDAddress
- newFromString
- decode
- encode
- equals
- bigintToArray
- getChecksum
- validateChecksum
- validateAddressString
- checkAddressString

## Test

`npm install`<br/>
`npm test`

## License

This repository is dual-licensed under Apache 2.0 and MIT terms.
