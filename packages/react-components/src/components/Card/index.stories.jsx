import React from 'react'
import Card from './index'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

export default {
  title: 'Card/Card',
  component: Card,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <Card {...args} />

export const Base = Template.bind({})
Base.args = {
  position: 'flex',
  flexDirection: 'row',
  border: '1',
  width: 'auto',
  alignItems: 'center',
  justifyContent: 'space-between',
  bg: 'blue',
  p: 4,
  children: <div>Hello world</div>
}
