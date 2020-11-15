import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import AccountCard from './index'

export default {
  title: 'AccountCard/AccountCard',
  component: AccountCard,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <AccountCard {...args} />

export const Base = Template.bind({})
Base.args = {
  onAccountSwitch: () => {},
  color: 'purple',
  address: 't0123456789',
  walletType: 'LEDGER',
  onShowOnLedger: () => {},
  ledgerBusy: false,
  mb: 2
}
