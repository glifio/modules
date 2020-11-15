import React from 'react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import InlineBox from './InlineBox'

export default {
  title: 'Box/InlineBox',
  component: InlineBox,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = (args) => <InlineBox {...args} />

export const Base = Template.bind({})
Base.args = {
  children: <span>Hello world</span>,
  position: 'flex',
  flexDirection: 'row',
  border: '1',
  width: 'auto',
  alignItems: 'center',
  justifyContent: 'space-between',
  bg: 'blue',
  p: 4
}
