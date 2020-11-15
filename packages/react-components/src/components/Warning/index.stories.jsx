import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import WarningCard from './index'

export default {
  title: 'WarningCard/WarningCard',
  component: WarningCard,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <WarningCard {...args} />

export const Base = Template.bind({})
Base.args = {
  description: 'A description',
  title: 'A title',
  linkhref: 'https://openworklabs.com',
  linkDisplay: 'Link Display'
}
