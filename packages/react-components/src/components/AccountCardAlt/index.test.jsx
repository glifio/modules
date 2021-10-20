import { cleanup, render, screen, act, fireEvent } from '@testing-library/react'
import AccountCardAlt from '.'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'

jest.mock('../../utils/copyToClipboard')

describe('AccountCardAlt', () => {
  afterEach(cleanup)
  test('renders the card', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <AccountCardAlt
          index={1}
          address='t0123456789'
          balance='100'
          onClick={() => {}}
          selected
        />
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the unselected card', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <AccountCardAlt
          index={1}
          address='t0123456789'
          balance='100'
          onClick={() => {}}
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Select')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders legacy address', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <AccountCardAlt
          index={1}
          address='t0123456789'
          balance='100'
          onClick={() => {}}
          legacy
        />
      </ThemeProvider>
    )
    expect(screen.getByText('Legacy')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders created address at random index', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <AccountCardAlt
          index={56}
          address='t0123456789'
          balance='100'
          onClick={() => {}}
        />
      </ThemeProvider>
    )
    expect(screen.getByText(/Created Account/)).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders address preview and balance', () => {
    render(
      <ThemeProvider theme={theme}>
        <AccountCardAlt
          index={1}
          address='t0123456789'
          balance='100'
          onClick={() => {}}
          selected
        />
      </ThemeProvider>
    )

    expect(screen.getByText('t0123', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('100', { exact: false })).toBeInTheDocument()
  })

  test('clicking the card calls mockOnAccountSwitch', () => {
    const mockOnAccountSwitch = jest.fn()
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccountCardAlt
          index={1}
          address='t0123456789'
          balance='100'
          onClick={mockOnAccountSwitch}
        />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByText('Select'))
    })

    expect(mockOnAccountSwitch).toHaveBeenCalled()
  })
})
