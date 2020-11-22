import { cleanup, render, act, fireEvent } from '@testing-library/react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import { ButtonClose, ButtonCopyAccountAddress } from '.'
import { ButtonCloseStory } from './ButtonClose.stories'
import { ButtonCopyAccountAddressStory } from './ButtonCopyAccountAddress.stories'

describe('ButtonClose', () => {
  afterEach(cleanup)

  test('story renders', () => {
    const mockOnClick = jest.fn()
    const { container } = render(
      <ButtonCloseStory {...ButtonCloseStory.args} onClick={mockOnClick} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the ButtonClose', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ButtonClose onClick={() => {}} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('clicking ButtonClose calls onClick', () => {
    const mockOnClick = jest.fn()
    const { getByTitle } = render(
      <ThemeProvider theme={theme}>
        <ButtonClose title='Close' disabled={false} onClick={mockOnClick} />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByTitle('Close'))
    })

    expect(mockOnClick).toHaveBeenCalled()
  })
})

describe('ButtonCopyAccountAddress', () => {
  afterEach(cleanup)

  test('story renders', () => {
    const mockOnClick = jest.fn()
    const { container } = render(
      <ButtonCopyAccountAddressStory
        {...ButtonCopyAccountAddressStory.args}
        onClick={mockOnClick}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the ButtonCopyAccountAddress', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ButtonCopyAccountAddress onClick={() => {}} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('clicking ButtonCopyAccountAddress calls onClick', () => {
    const mockOnClick = jest.fn()
    const { getByTitle } = render(
      <ThemeProvider theme={theme}>
        <ButtonCopyAccountAddress title='Copy' onClick={mockOnClick} />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByTitle('Copy'))
    })

    expect(mockOnClick).toHaveBeenCalled()
  })
})
