import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import { Base } from './index.stories'

describe('NetworkSwitcherGlyph', () => {
  afterEach(cleanup)
  test('renders NetworkSwitcherGlyph', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Base {...Base.args} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
