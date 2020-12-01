import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import HeaderGlyph from './HeaderGlyph'

export default {
  title: 'Glyph/HeaderGlyph',
  component: HeaderGlyph,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <HeaderGlyph {...args} />

export const Base = Template.bind({})
Base.args = {
  alt: 'Source: https://www.nontemporary.com/post/190437968500',
  text: 'Wallet',
  imageUrl: '/imgwallet.png',
  color: 'black'
}
