import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import { MAINNET } from '../../constants'

import NetworkSwitcherGlyph from './index'

export default {
  title: 'NetworkSwitcherGlyph/NetworkSwitcherGlyph',
  component: NetworkSwitcherGlyph,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <NetworkSwitcherGlyph {...args} />

export const Base = Template.bind({})
Base.args = {
  network: MAINNET
}
