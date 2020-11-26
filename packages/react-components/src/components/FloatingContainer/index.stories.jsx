import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import FloatingContainer from './index'

export default {
  title: 'FloatingContainer/FloatingContainer',
  component: FloatingContainer,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <FloatingContainer {...args} />

export const Base = Template.bind({})
Base.args = {
  children: <div>Hello world</div>
}
