import React from 'react'

import InlineBox from './inlineBox'

export default {
  title: 'Box/InlineBox',
  component: InlineBox,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Story />
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
