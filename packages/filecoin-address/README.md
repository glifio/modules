# filecoin-address

This is a JS implementation of the Filecoin address type, inspired by [go-address](https://github.com/filecoin-project/go-address). It can create new address instances and encode addresses, and it takes care of decoding and validating checksums.

## Install

`npm i @glif/filecoin-address`

## Usage

```js
const {
  decode,
  encode,
  CoinType,
  delegatedFromEthAddress,
  ethAddressFromDelegated
} = require('@glif/filecoin-address')

const address = decode('t1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei')
const addressProtocol = address.protocol()
const addressPayload = address.payload()
const addressBytes = address.bytes // Uint8Array
const addressString = address.toString()

const encoded = encode(CoinType.TEST, address)

const delegated = delegatedFromEthAddress(
  '0x52963EF50e27e06D72D59fcB4F3c2a687BE3cfEf',
  CoinType.TEST
)
const ethAddress = ethAddressFromDelegated(delegated)
```

## API

### Enums and types

- `CoinType` / `Network`: `'f'` (mainnet) and `'t'` (testnet)
- `Protocol`: `ID`, `SECP256K1`, `ACTOR`, `BLS`, `DELEGATED`
- `DelegatedNamespace`: currently `EVM = 10`
- `EthAddress`: type alias for `0x...` hex Ethereum addresses
- `AddressData`: parsed address metadata returned by `checkAddressString`

### `Address` class

- `new Address(bytes, coinType?)`
- Instance members:
  - `bytes`
  - `network()`
  - `coinType()`
  - `protocol()`
  - `payload()`
  - `namespaceLength` (delegated only)
  - `namespace` (delegated only)
  - `subAddr` (delegated only)
  - `subAddrHex` (delegated only)
  - `toString()`
  - `equals(address)`

### Address constructors

- `newAddress(protocol, payload, coinType?)`
- `newIDAddress(id, coinType?)`
- `newActorAddress(data, coinType?)`
- `newSecp256k1Address(pubkey, coinType?)`
- `newBLSAddress(pubkey, coinType?)`
- `newDelegatedAddress(namespace, subAddr, coinType?)`
- `newDelegatedEthAddress(ethAddr, coinType?)`

### Parse, encode, and validation helpers

- `decode(address)` (alias: `newFromString(address)`)
- `encode(coinType, address)`
- `validateAddressString(addressString)`
- `checkAddressString(addressString)`
- `bigintToArray(value)`
- `getChecksum(data)`
- `validateChecksum(data, checksum)`

### ID and FEVM/EVM helpers

- `idFromAddress(address)`
- `idFromPayload(payload)`
- `delegatedFromEthAddress(ethAddr, coinType?)`
- `ethAddressFromDelegated(delegatedAddress)`
- `isEthAddress(address)`
- `isEthIdMaskAddress(ethAddr)`
- `idFromEthAddress(ethAddr, coinType?)`
- `ethAddressFromID(idAddress)`

## Test

`npm install`<br/>
`npm test`

## License

This repository is dual-licensed under Apache 2.0 and MIT terms.
