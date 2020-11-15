import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import DisplayWord from './DisplayWord'

export default {
  title: 'MnemonicWord/DisplayWord',
  component: DisplayWord,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <DisplayWord {...args} />

export const Base = Template.bind({})
Base.args = {
  word: 'hello world',
  num: 12,
  valid: true
}
