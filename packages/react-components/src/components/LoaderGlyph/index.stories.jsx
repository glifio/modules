import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import LoaderGlyph from './index'

export default {
  title: 'LoaderGlyph/LoaderGlyph',
  component: LoaderGlyph,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <LoaderGlyph {...args} />

export const Base = Template.bind({})
Base.args = {}
