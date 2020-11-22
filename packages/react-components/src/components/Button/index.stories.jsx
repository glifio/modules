import Button from './index'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

export default {
  title: 'Button/Button',
  component: Button,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <Button {...args} />

export const Base = Template.bind({})
Base.args = {
  title: 'Next'
}
