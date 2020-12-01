import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import ErrorView from './index'

export default {
  title: 'Error/ErrorView',
  component: ErrorView,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <ErrorView {...args} />

export const Base = Template.bind({})
Base.args = {
  title: 'Ledger only supports Chrome',
  description:
    'Please install Google Chrome to continue using your Ledger device, or choose an alternative setup option',
  linkDisplay: 'Install Google Chrome.',
  linkhref: 'https://www.google.com/chrome'
}
