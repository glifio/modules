# modules

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

