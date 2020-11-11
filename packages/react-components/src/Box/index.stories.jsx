import React from 'react'

import Box from './index'

export default {
  title: 'Box/Box',
  component: Box,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = (args) => <Box {...args} />

export const Base = Template.bind({})
Base.args = {
  children: <div>Hello world</div>,
  position: 'flex',
  flexDirection: 'row',
  border: '1',
  width: 'auto',
  alignItems: 'center',
  justifyContent: 'space-between',
  bg: 'blue',
  p: '4'
}
