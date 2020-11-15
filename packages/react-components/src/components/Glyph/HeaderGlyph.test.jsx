import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import HeaderGlyph from './HeaderGlyph'
import { Base } from './HeaderGlyph.stories'

describe('HeaderGlyph', () => {
  afterEach(cleanup)

  test('renders the story', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Base {...Base.args} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the HeaderGlyph', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <HeaderGlyph
          alt='Source: https://www.nontemporary.com/post/190437968500'
          text='Wallet'
          imageUrl='/imgwallet.png'
          color='black'
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
    expect(screen.getByText('Wallet')).toBeInTheDocument()
  })
})
