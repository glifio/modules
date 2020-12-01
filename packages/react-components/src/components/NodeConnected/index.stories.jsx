import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import NodeConnected from './index'

export default {
  title: 'NodeConnected/NodeConnected',
  component: NodeConnected,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <NodeConnected {...args} />

export const Base = Template.bind({})
Base.args = {
  apiAddress: 'https://node.glif.io/02/rpc/v0'
}
