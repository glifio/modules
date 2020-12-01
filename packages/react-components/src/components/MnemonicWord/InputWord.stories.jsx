import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import InputWord from './InputWord'

export default {
  title: 'MnemonicWord/InputWord',
  component: InputWord,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^set.*' } }
}

const Template = args => <InputWord {...args} />

export const Base = Template.bind({})
Base.args = {
  num: 12,
  wordToMatch: 'hello world',
  importSeedError: false,
  correctWordCount: 2
}
