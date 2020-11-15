import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import AccountError from './Error'

export default {
  title: 'AccountCard/AccountError',
  component: AccountError,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <AccountError {...args} />

export const Base = Template.bind({})
Base.args = {
  errorMsg: 'There was an error'
}
