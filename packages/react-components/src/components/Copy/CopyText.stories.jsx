import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import { CopyText } from './CopyText'

export default {
  title: 'Copy/CopyText',
  component: CopyText,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <CopyText {...args} />

export const Base = Template.bind({})
Base.args = {
  text: 'value'
}
