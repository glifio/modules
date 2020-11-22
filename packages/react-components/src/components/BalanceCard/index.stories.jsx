import { FilecoinNumber } from '@glif/filecoin-number'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import BalanceCard from './index'

export default {
  title: 'BalanceCard/BalanceCard',
  component: BalanceCard,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <BalanceCard {...args} />

export const Base = Template.bind({})
Base.args = {
  balance: new FilecoinNumber('100', 'fil')
}
