import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import { CopyAddress } from './index'

export default {
  title: 'Copy/CopyAddress',
  component: CopyAddress,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <CopyAddress {...args} />

export const Base = Template.bind({})
Base.args = {
  address: 'f17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy'
}
