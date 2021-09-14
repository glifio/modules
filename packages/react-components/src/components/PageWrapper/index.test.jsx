import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import PageWrapper from '.'

describe('PageWrapper', () => {
  afterEach(cleanup)
  test('renders the PageWrapper', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <PageWrapper>Test</PageWrapper>
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
