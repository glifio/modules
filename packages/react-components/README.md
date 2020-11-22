# @glif/react-components

Shared @glif/react-components!

```
npm install @glif/react-components
```

## Usage

``` jsx
import {
  Box
} from '@glif/react-components'

function Component () {
  return (
    <Box>Hello World</Box>
  )
}
```

### Storybooks

Clone the project locally and run:

```
npm i
npm run storybook
```

## API

WIP.  In the meantime:

```js
export { default as theme } from './theme'
export { default as ThemeProvider } from './ThemeProvider'

export { default as Container } from './Container'
export { default as Card } from './Card'
export { default as OnboardCard } from './Card/OnboardCard'
export { default as AccountCard } from './AccountCard'
export { default as AccountError } from './AccountCard/Error'
export { default as BalanceCard } from './BalanceCard'
export { default as ApproximationToggleBtn } from './BalanceCard/ApproximationToggleBtn'
export { default as Input } from './Input'
export { default as Form } from './Form'
export { default as Address } from './Address'
export * from './Copy'
export { default as Button } from './Button'
export { default as BaseButton } from './Button/BaseButton'
export { default as Stepper } from './Stepper'
export { default as HeaderGlyph } from './Glyph/HeaderGlyph'
export { default as Glyph } from './Glyph'
export { default as Box } from './Box'
export { default as InlineBox } from './Box/InlineBox'
export { default as MessageHistoryTable } from './MessageHistoryTable'
export { default as FloatingContainer } from './FloatingContainer'
export { default as Loading } from './LoaderGlyph'
export { default as LoadingScreen } from './LoadingScreen'
export { default as NetworkSwitcherGlyph } from './NetworkSwitcherGlyph'
export { default as NodeConnectingGlyph } from './NodeConnected'
export { default as StepHeader } from './StepHeader'
export { default as ErrorView } from './Error'
export { default as Warning } from './Warning'
export { default as Tooltip } from './Tooltip'
export * from './Link'
export * from './Menu'
export * from './Icons'
export * from './IconButtons'
export * from './MnemonicWord'

export * from './Layout'

export * from './Typography'
```

## FAQ

### Multiple React warnings when linking

Peer dependencies should be resolved to a single instance by your bundler.  In Next.js, you can add the following field to your `next.config.js` config object:

```js
const path = require('path')
const webpack = (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    react: path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
    next: path.resolve('./node_modules/next'),
    'styled-components': path.resolve('./node_modules/styled-components')
  }

  return config;
}

module.exports = {
  webpack
}
```

## License

MIT
