# Filecoin wallet provider

:warning: Active development. Unstable. Breaking Changes. You get the point.

This wallet provider module is inspired as a combination between [MetaMask's keyring controller](https://github.com/MetaMask/KeyringController) and [web3.js](https://github.com/ethereum/web3.js/). It's experimental so it's likely that it will change, drastically. Below is a description of our design decisions, how it's working, and development plan over the coming weeks/months.

## Usage

```js
import Filecoin, {
  LocalNodeProvider,
} from '@glif/filecoin-wallet-provider'

const config = {
  apiAddress: process.env.API_ADDRESS // defaults to 'http://127.0.0.1:1234/rpc/v0',
  token: process.env.LOTUS_JWT_TOKEN, // required
}

const filecoin = new Filecoin(new LocalNodeProvider(config), config)
```

### Methods:

##### getBalance

Returns a promise that resolves to a javascript [bignumber.js](https://github.com/MikeMcl/bignumber.js/) object with the accounts balance:

```js
const config = {
  apiAddress: process.env.API_ADDRESS // defaults to 'http://127.0.0.1:1234/rpc/v0',
  token: process.env.LOTUS_JWT_TOKEN, // required
}
const filecoin = new Filecoin(new LocalNodeProvider(config), config)

const balance = await filecoin.getBalance(
  't1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza',
)
console.log(balance.toString())
// 1000000000000
```

#### getNonce

```js
const config = {
  apiAddress: process.env.API_ADDRESS // defaults to 'http://127.0.0.1:1234/rpc/v0',
  token: process.env.LOTUS_JWT_TOKEN, // required
}
const filecoin = new Filecoin(new LocalNodeProvider(config), config)

const nonce = await filecoin.getNonce(
  't1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza',
)
console.log(nonce)
// returns a number representing the nonce
```

##### sendMessage

Takes a signed message, and resolves a promise whne the transaction is completed (note in the future this should resolve to the SignedMessage `cid`).

```js
const config = {
  apiAddress: process.env.API_ADDRESS // defaults to 'http://127.0.0.1:1234/rpc/v0',
  token: process.env.LOTUS_JWT_TOKEN, // required
}
const filecoin = new Filecoin(new LocalNodeProvider(config), config)

// note, see section below on signedMessages
await filecoin.sendMessage(signedMessage)
```

#### Wallet methods exposed from the Provider class (more info below on Provider class)

```js
const config = {
  apiAddress: process.env.API_ADDRESS // defaults to 'http://127.0.0.1:1234/rpc/v0',
  token: process.env.LOTUS_JWT_TOKEN, // required
}
const filecoin = new Filecoin(new LocalNodeProvider(config), config)

await filecoin.wallet.sign(message) // returns a signed message
await filecoin.wallet.getAccounts() // ['t1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza', 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei']
await filecoin.wallet.newAccount() // 't1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza'
```

### Provider class

The Filecoin class takes a required "provider" object that implements 3 methods. It should be easy to create a Provider class for Ledger, Trust, wasm based signing libs...etc.

The below examples show how the Provider class should function using the `LocalNodeProvider` as an example.

##### newAccount

Returns a promise that resolves to the Filecoin address of a new account

```js
const provider = new LocalNodeProvider({
  apiAddress: 'http://127.0.0.1:1234/rpc/v0',
  token: 'your_lotus_jwt_',
})

const newAccount = await provider.newAccount()
console.log(newAccount)
// 't1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza'
```

##### getAccounts

Returns a promise that resolves to an array of Filecoin addresses

```js
const provider = new LocalNodeProvider({
  apiAddress: 'http://127.0.0.1:1234/rpc/v0',
  token: 'your_lotus_jwt_',
})

const accounts = await provider.getAccounts()
console.log(accounts)
// ['t1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza', 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei']
```

##### sign

Returns a promise that resolves to a Filecoin [signedMessage]()

```js
const provider = new LocalNodeProvider({
  apiAddress: 'http://127.0.0.1:1234/rpc/v0',
  token: 'your_lotus_jwt_',
})

// message is a proper Filecoin message, see section below on messages for more details

const signedMsg = await provider.sign(path, message)
console.log(signedMsg)
/*
{
  "jsonrpc":"2.0",
  "result":
    {
      "Message": {
        "To":"t1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei",
        "From":"t1t5gdjfb6jojpivbl5uek6vf6svlct7dph5q2jwa",
        "Nonce":0,
        "Value":"1000",
        "GasPrice":"3",
        "GasLimit":"1000",
        "Method":0,
        "Params":""
      },
      "Signature": {
        "Type":"secp256k1",
        "Data":"CGZgFHeA5g38txFq6ojwh63wlFGKhNl/ZUZPgTGfNB1IStobmY4VucPa/KteaxJjhFlfm/DBCjTqzhzFK+tKuwE="
      }
    },
  "id":1
}
*/
```

### Design decisions & future

At a high level, a simple wallet relies on 2 types of functions:
(1) methods that require access to private keys
(2) methods that do not require access to private keys

For example, `signMessage` and `getAccounts` are two methods that would require access to a private key, whereas `getBalance`, `getNonce`, and `sendSignedMessage` do not rely on having access to private keys (these are all made up method names).

This naturally lends itself to an architecture that should allow developers to "plug-and-play" their own modules that handle "private key methods", and not have to worry about re-implementing their own "non-private key methods". In other words, a developer should be able to do something like this:

```js
const Filecoin = require('@glif/filecoin-wallet-provider')

const filecoin = new Filecoin()

await filecoin.addWalletProvider(new LedgerWallet())
await filecoin.addWalletProvider(new SimpleJSWallet())

const accounts = await filecoin.listAccounts()
// ['t1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza', 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei']
// Returns accounts from both wallet types
```

Ideally, each Wallet Class in the above example will follow a simple interface and exposes a few functions, similar to MetaMask's [Keyring Class Protocol](t1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei). We could match this interface with the `Wallet` methods in the [Lotus jsonrpc](https://github.com/filecoin-project/lotus/blob/master/api/api_full.go) (with the exception of `balance` and `list` because those do not need access to underlying private keys).
