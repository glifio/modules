import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import AppTile from './index'

export default {
  title: 'AppTile/AppTile',
  component: AppTile,
  decorators: [
    Story => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
      </div>
    )
  ],
  parameters: { actions: { argTypesRegex: '^on.*' } }
}

const Template = args => <AppTile {...args} />

export const Base = Template.bind({})
Base.args = {
  title: 'Safe',
  description: 'A Filecoin multisig wallet.',
  oldTileName: 'Vault',
  href: '/',
  imgSrc: '/static/bg-safe.png'
}
