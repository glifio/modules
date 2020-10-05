# filecoin-message

## Install

`npm i @glif/filecoin-message`

## Usage

```js
const Message = require('@glif/filecoin-message')
const BigNumber = require('bignumber.js')

const message = new Message({
  to: 't03832874859695014541',
  from: 't1pyfq7dg6sq65acyomqvzvbgwni4zllglqffw5dy',
  nonce: 1,
  value: new BigNumber('1000000000'),
  method: 0
})

const messageForSerialization = await message.toSerializeableType()
const messageForLotus = message.toLotusType()
```

## Test

`npm i`<br/>
`npm run test`

## License

This repository is dual-licensed under Apache 2.0 and MIT terms.
