import React from 'react'
import { cleanup, render, act, fireEvent } from '@testing-library/react'
import Button from '.'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

describe('Button', () => {
  afterEach(cleanup)
  test('renders the Button', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Button title='Next' onClick={() => {}} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the button with the right attributes', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Button
          title='Next'
          disabled={false}
          onClick={() => {}}
          variant='primary'
          ml={2}
          p={2}
          height='max-content'
          border='3px solid blue'
        />
      </ThemeProvider>
    )

    const button = container.querySelector('button')
    expect(button).toHaveStyle(
      'margin-left: 8px;',
      'padding: 16px;',
      'height: max-content;',
      'border: 3px solid blue;'
    )
  })

  test('clicking "Next" calls onClick', () => {
    const mockOnClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button title='Next' disabled={false} onClick={mockOnClick} />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByText('Next'))
    })

    expect(mockOnClick).toHaveBeenCalled()
  })

  test('renders a disabled button with disabled color', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Button
          title='Next'
          disabled
          onClick={() => {}}
          variant='primary'
          ml={2}
          p={2}
          height='max-content'
          border='3px solid blue'
        />
      </ThemeProvider>
    )

    const button = container.querySelector('button')
    expect(button).toHaveStyle(
      `background-color: ${theme.colors.status.inactive};`
    )
    expect(button.disabled).toBe(true)
  })

  test("renders a button that's not disabled", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Button
          title='Next'
          disabled={false}
          onClick={() => {}}
          variant='primary'
          ml={2}
          p={2}
          height='max-content'
          border='3px solid blue'
        />
      </ThemeProvider>
    )

    const button = container.querySelector('button')
    expect(button.disabled).toBe(false)
    expect(button).toHaveStyle(
      `color: ${theme.colors.buttons.primary.color};
      background-color: ${theme.colors.buttons.primary.background};`
    )
  })

  test('applies the secondary variant', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Button title='Next' variant='secondary' />
      </ThemeProvider>
    )

    const button = container.querySelector('button')
    expect(button).toHaveStyle(
      `color: ${theme.colors.buttons.secondary.color};
      background-color: ${theme.colors.buttons.secondary.background};`
    )
  })
})
