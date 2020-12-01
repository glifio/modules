import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import LoadingScreen from './index'

export default {
  title: 'LoadingScreen/LoadingScreen',
  component: LoadingScreen,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <LoadingScreen {...args} />

export const Base = Template.bind({})
Base.args = {}
