import ButtonLink from './ButtonLink'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

export default {
  title: 'Link/ButtonLink',
  component: ButtonLink,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <ButtonLink {...args} />

export const Base = Template.bind({})
Base.args = {
  name: 'Next',
  href: '#'
}
