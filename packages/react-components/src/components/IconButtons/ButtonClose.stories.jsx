import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import { ButtonClose } from './index'

export default {
  title: 'IconButtons/ButtonClose',
  component: ButtonClose,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: { onClick: { action: 'clicked' } }
}

const Template = (args) => <ButtonClose {...args} />

export const ButtonCloseStory = Template.bind({})
ButtonCloseStory.args = {
  disabled: false,
  title: 'Close'
}
