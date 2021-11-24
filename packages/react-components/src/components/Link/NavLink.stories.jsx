import NavLink from './NavLink'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

export default {
  title: 'Link/NavLink',
  component: NavLink,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => {
  return (
    <>
      <NavLink {...args}>{args.name}</NavLink>
    </>
  )
}

export const Active = Template.bind({})
Active.args = {
  rel: 'noopener',
  target: '_blank',
  isActive: true,
  href: 'https://google.com',
  name: 'Active Item'
}

export const Inactive = Template.bind({})
Inactive.args = {
  rel: 'noopener',
  target: '_blank',
  isActive: false,
  href: 'https://google.com',
  name: 'Inactive Item'
}
