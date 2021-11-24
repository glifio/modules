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
          path=''
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
          path=''
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
          path="m/44'/1'/0'/0/1"
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
          path="m/44'/461'/0'/0/56"
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
          path=''
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
          path=''
        />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByText('Select'))
    })

    expect(mockOnAccountSwitch).toHaveBeenCalled()
  })
})
