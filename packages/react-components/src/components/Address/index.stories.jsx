import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import Address from './index'

export default {
  title: 'Address/Address',
  component: Address,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <Address {...args} />

export const Base = Template.bind({})
Base.args = {
  address: 'f17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy'
}
