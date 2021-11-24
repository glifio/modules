import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import AccountCardAlt from './index'

export default {
  title: 'AccountCardAlt/AccountCardAlt',
  component: AccountCardAlt,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <AccountCardAlt {...args} />

export const NotSelected = Template.bind({})
NotSelected.args = {
  address: 'f1as4l7up4v74asdfqfwd2uhkasd7h7ai3wsiznqmcq',
  index: 0,
  selected: false,
  balance: '100',
  onClick: () => {}
}

export const Selected = Template.bind({})
Selected.args = {
  address: 'f1as4l7up4v74asdfqfwd2uhkasd7h7ai3wsiznqmcq',
  index: 0,
  selected: true,
  balance: '100',
  onClick: () => {}
}

export const NotDefault = Template.bind({})
NotDefault.args = {
  address: 'f1as4l7up4v74asdfqfwd2uhkasd7h7ai3wsiznqmcq',
  index: 1,
  selected: false,
  balance: '100',
  onClick: () => {}
}

export const Error = Template.bind({})
Error.args = {
  address: 'jf2nionnnni',
  index: 1,
  selected: false,
  onClick: () => {}
}
