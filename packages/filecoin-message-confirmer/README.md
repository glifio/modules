# filecoin-message

## Install

`npm i @glif/filecoin-message-confirmer`

## Usage

```js
const confirmMessage = require('@glif/filecoin-message-confirmer')

const messageCid =
  'bafy2bzacebnyjf5oxzvts5f4ifqgee2yrqb7epdepnw3y2yk25ju5su2episg'
const optionalConfig = {}
const confirmed = await confirmMessage(messageCid, optionalConfig)
// > true if message is confirmed
// > false if message happened far in the past (just use a block explorer) or if the message isn't yet confirmed after ~7-8 minutes after sending
```

The confirmer takes an optional config:

```ts
interface ConfirmerConfig {
  apiAddress: string
  token?: string
  // the amount of time to timeout the request
  timeoutAfter?: number
  // the number of times this function calls itself, recursively
  totalRetries?: number
}
```

It's recommended to stick with the default values for `timeoutAfter` (90000 ms) and `totalRetries` (5 times)

## Test

`npm i`<br/>
`npm run test`

## License

This repository is dual-licensed under Apache 2.0 and MIT terms.
