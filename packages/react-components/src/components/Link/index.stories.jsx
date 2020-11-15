import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import { StyledATag } from './index'

export default {
  title: 'Link/StyledATag',
  component: StyledATag,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <StyledATag {...args} />

export const Base = Template.bind({})
Base.args = {
  rel: 'noopener',
  target: '_blank',
  href: 'https://openworklabs.com',
  fontSize: 3,
  color: 'core.black',
  children: 'Link text'
}
