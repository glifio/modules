# Local managed provider

:warning: Active development. Unstable. Breaking Changes. You get the point.

This wallet subprovider handles signing by a managed raw private key. Supports secp256k1 and BLS keys.

## Installation

```
npm add @glif/local-managed-provider @glif/filecoin-address @glif/filecoin-message
```

## Usage

```js
import { LocalManagedProvider } from '@glif/local-managed-provider'
import { Network } from '@glif/filecoin-address'
import { SignedLotusMessage } from '@glif/filecoin-message'
// Hex of JSON, same as returned by Lotus `wallet export` command.
const secp256k1Key =
  '7b2254797065223a22736563703235366b31222c22507269766174654b6579223a2257587362654d5176487a366f5668344b637262633045642b31362b3150766a6a504f3753514931355031343d227d'
const provider = new LocalManagedProvider(secp256k1Key, Network.TEST)
const accounts = await provider.getAccounts() // t17lxg2i2otnl7mmpw2ocd6o4e3b4un3272vny6ka
const sig: SignedLotusMessage = await provider.sign(address, {
  From: address,
  To: address,
  Value: '0',
  Method: 0,
  GasPrice: '1',
  GasFeeCap: '1',
  GasPremium: '1',
  GasLimit: 1000,
  Nonce: 0,
  Params: '',
}) // Returns SignedLotusMessage
```
