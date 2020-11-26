import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import Tooltip from './index'

export default {
  title: 'Tooltip/Tooltip',
  component: Tooltip,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <Tooltip {...args} />

export const Base = Template.bind({})
Base.args = {
  content: 'tooltip content',
  color: 'core.black'
}
