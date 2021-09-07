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
      <NavLink {...args} href={'#1'} name={'Item 1'} />
      <NavLink {...args} href={'#2'} name={'Active Item'} isActive={true} />
      <NavLink {...args} href={'#3'} name={'Item 3'} />
    </>
  )
}

export const Base = Template.bind({})
Base.args = {
  name: 'Next',
  href: '#'
}
