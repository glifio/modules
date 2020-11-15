import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { StyledATag } from '.'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import { Base } from './index.stories'

describe('StyledATag', () => {
  afterEach(cleanup)

  test('storybook example renders', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Base {...Base.args} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the StyledATag', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <StyledATag
          rel='noopener'
          target='_blank'
          href='https://openworklabs.com'
          fontSize={3}
          color='core.white'
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the StyledATag with the right attributes', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <StyledATag
          rel='noopener'
          target='_blank'
          href='https://openworklabs.com/'
          fontSize={3}
          color='core.white'
        />
      </ThemeProvider>
    )

    const a = container.querySelector('a')
    expect(a.target).toBe('_blank')
    expect(a.href).toBe('https://openworklabs.com/')
    expect(a).toHaveStyle('font-size: 1.25rem; color: rgb(255, 255, 255);')
  })

  test('renders text in StyledATag', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <StyledATag
          rel='noopener'
          target='_blank'
          href='https://openworklabs.com'
          fontSize={3}
          color='core.white'
        >
          Send
        </StyledATag>
      </ThemeProvider>
    )

    expect(getByText('Send')).toBeTruthy()
  })
})
