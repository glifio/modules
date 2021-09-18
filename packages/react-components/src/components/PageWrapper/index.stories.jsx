import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import PageWrapper from './index'

export default {
  title: 'PageWrapper/PageWrapper',
  component: PageWrapper,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <PageWrapper {...args} />

export const Base = Template.bind({})
Base.args = {
  children: <div>Hello world</div>,
  bg: 'blue'
}
