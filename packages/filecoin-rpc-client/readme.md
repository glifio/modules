# Lotus JSON-RPC engine

A convenience library for interacting with the [Lotus JSON-RPC api](https://github.com/filecoin-project/lotus/blob/master/api/api_full.go). We'll be actively updating and maintaining this library as needed for our use in the [Filecoin web wallet](https://github.com/glifio/wallet). Several of the methods we're using are documented [here](https://documenter.getpostman.com/view/4872192/SWLh5mUd?version=latest).

## Basic usage

`npm i @glif/filecoin-rpc-client`<br />

```js
const LotusRPCEngine = require('@glif/filecoin-rpc-client')

const lotusJWT = 'aaaaaaaa.bbbbbbbbbbbb.i_ZZZZZZ-3xYYYYYY'

const config = {
  // defaults to local as seen below
  apiAddress: 'http://127.0.0.1:1234/rpc/v0',
  token: lotusJWT,
}

const lotusRPC = new LotusRpcEngine(config)

const chainHead = await lotusRPC.request('ChainHead')
```

## Structuring requests

This library is simply a wrapper around Lotus' JSON-RPC. To send requests, follow this pattern:

lotusRPC.request(rpcmethod, arg1, arg2....etc) where the "methodName" corresponds to each available JSON-RPC method (found [here](https://github.com/filecoin-project/lotus/blob/master/api/api_full.go)). After the method name, each argument is passed to Lotus' JSON-RPC in the same order.

For example, the `WalletBalance` JSON-RPC method takes a single argument, "address". Therefore, we should structure the request like:

```js
const address = 't1jdlfl73voaiblrvn2yfivvn5ifucwwv5f26nfza'
const balance = await lotusRPC.request('WalletBalance', address)
```

## Handling responses

When making a request to Lotus' JSON-RPC server, a success response looks like:

```js
const successResponse = {
  jsonrpc: '2.0',
  result: 'fake response result',
  id: 1,
}
```

The `result` key is the return data as specified in the [Lotus api](https://github.com/filecoin-project/lotus/blob/master/api/api_full.go[]). The Lotus JSON-RPC Engine will just return you the `result`, and not any of the other data.

```js
const errorResponse = {
  jsonrpc: '2.0',
  result: '',
  id: 1,
  error: {
    code: 1,
    message: 'Specific error returned by Lotus API',
  },
}
```

This functionality may change, but for now, the Lotus JSON-RPC Engine will throw an error if the Lotus API comes back with an error, so be sure to catch them:

```js
try {
  // send a malformed request (need to pass an address)
  await lotusRPC.request('WalletBalance')
} catch (err) {
  console.log(err)
  // 'get actor: GetActor called on undefined address' <== error directly passed from Lotus' API
}
```

## Cids

Several JSON-RPC methods take `Cid` as arguments. We need to structure a cid as:

```js
const cid = {
  '/': 'bafy2bzacedavr434vvbck3nkowrffk2x67lgl7kfujlw3lyj2zjvmihn5rf7i',
}

const message = await lotusRPC.request('ChainGetMessage', cid)
```

## CORS

If you're planning on using this library in a web browser communicating with a raw Lotus node, you will run into CORS issues. There are a couple ways around this:

1. Wrap your Lotus node in a proxy server that explicitly handles CORS requests. We're working on publishing a proxy server to help unstuck anyone who needs to take this route.
2. Wrap your web browser in a "forwarder API", which is responsible for sending / receiving information from the Lotus node (essentially sending browser requests to a remote server to make the request to Lotus).
3. Figure out how to handle CORS natively inside Lotus (not suggested). Security issues with this approach.

## Contributing / development

If you're planning on forking this lib or developing with it locally, use the build script:

`npm run build`

## Troubleshooting

Please make sure an existing issue doesn't already cover your problem before asking. If you don't see a similar issue, go ahead and file a new one in the repository.
