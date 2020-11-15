import React from 'react'
import { cleanup, render } from '@testing-library/react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import { Base } from './Error.stories'

describe('AccountError', () => {
  afterEach(cleanup)

  test('renders the story', () => {
    const mockOnTryAgain = jest.fn()
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Base {...Base.args} onTryAgain={mockOnTryAgain} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
