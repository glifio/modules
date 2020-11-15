import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import Glyph from './index'

export default {
  title: 'Glyph/Glyph',
  component: Glyph,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <Glyph {...args} />

export const Base = Template.bind({})
Base.args = {
  acronym: 'Sw',
  bg: 'core.primary',
  borderColor: 'core.primary',
  color: 'core.white'
}
