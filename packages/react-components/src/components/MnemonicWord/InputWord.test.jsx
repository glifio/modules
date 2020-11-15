import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

import { Base } from './InputWord.stories'

describe('Box', () => {
  afterEach(cleanup)
  test('renders the story', () => {
    const mockSetCorrectWordCount = jest.fn()
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Base {...Base.args} setCorrectWordCount={mockSetCorrectWordCount} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
