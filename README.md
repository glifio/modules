# modules

## :warning: UNMAINTAINED PACKAGES :warning:

The following packages are no longer maintained:

- [@glif/deployment-cli](https://github.com/glifio/modules/tree/primary/packages/deployment-cli)
- [@glif/filecoin-message](https://github.com/glifio/modules/tree/primary/packages/filecoin-message)
- [@glif/filecoin-message-confirmer](https://github.com/glifio/modules/tree/primary/packages/filecoin-message-confirmer)
- [@glif/filecoin-rpc-client](https://github.com/glifio/modules/tree/primary/packages/filecoin-rpc-client)
- [@glif/filecoin-wallet-provider](https://github.com/glifio/modules/tree/primary/packages/filecoin-wallet-provider)
- [@glif/local-managed-provider](https://github.com/glifio/modules/tree/primary/packages/local-managed-provider)
- [@glif/logger](https://github.com/glifio/modules/tree/primary/packages/logger)

--- 

![tests](https://github.com/glifio/modules/workflows/tests/badge.svg)

This is a lerna repo that holds our npm modules. They can all be found in the `/packages` directory.

## Testing

CI is configured to run `npm test` in every package on every interaction with the repo.  Ensure all testing hooks are wired up to be run on the individual package's `test` script hook.

## Automatic dependency updates

Dependabot is monitoring every npm and github action for updates.

Updates for Github Actions are automatically merged if tests are passing.

## Releasing

Releases are made using the [`lerna publish` action](https://github.com/glifio/modules/actions?query=workflow%3A%22lerna+publish%22).
These are trigged by hand using `workflow_dispatch` and will `lerna publush` whatever version flag you pass in.
Tests must be passing for a publish to succeed.

