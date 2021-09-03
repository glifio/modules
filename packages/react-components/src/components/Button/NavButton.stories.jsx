import NavButton from './NavButton'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

export default {
  title: 'Button/NavButton',
  component: NavButton,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <NavButton {...args} />

export const Base = Template.bind({})
Base.args = {
  title: 'Next'
}
