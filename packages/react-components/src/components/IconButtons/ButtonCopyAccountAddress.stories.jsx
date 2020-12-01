import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import { ButtonCopyAccountAddress } from './index'

export default {
  title: 'IconButtons/ButtonCopyAccountAddress',
  component: ButtonCopyAccountAddress,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: { onClick: { action: 'clicked' } }
}

const Template = args => <ButtonCopyAccountAddress {...args} />

export const ButtonCopyAccountAddressStory = Template.bind({})
ButtonCopyAccountAddressStory.args = {
  disabled: false
}
