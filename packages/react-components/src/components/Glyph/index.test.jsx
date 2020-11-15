import React from 'react'
import { cleanup, render } from '@testing-library/react'
import ThemeProvider from '../ThemeProvider'
import Glyph from '.'
import theme from '../theme'
import { Base } from './index.stories'

describe('Glyph', () => {
  afterEach(cleanup)

  test('renders the story', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Base {...Base.args} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the glyph', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Glyph
          acronym='Sw'
          bg='core.primary'
          borderColor='core.primary'
          color='core.white'
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the glyph with the text', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Glyph
          acronym='Sw'
          bg='core.primary'
          borderColor='core.primary'
          color='core.white'
        />
      </ThemeProvider>
    )

    expect(getByText('Sw')).toBeTruthy()
  })

  test('renders a Glyph with correct colors', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Glyph acronym='Sw' bg='core.secondary' color='core.white' />
      </ThemeProvider>
    )

    const div = container.querySelector('div')
    expect(div).toHaveStyle(
      `color: ${theme.colors.core.white};
      background-color: ${theme.colors.core.secondary};`
    )
  })
})
