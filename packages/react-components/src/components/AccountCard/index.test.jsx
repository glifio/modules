/* eslint-disable import/first */
/* eslint-disable import/newline-after-import */
import { cleanup, render, screen, act, fireEvent } from '@testing-library/react'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import AccountCard from '.'
jest.mock('../../utils/copyToClipboard')
import copyToClipboard from '../../utils/copyToClipboard'
import { Base } from './index.stories'

describe('AccountCard', () => {
  afterEach(cleanup)

  test('renders the story', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Base {...Base.args} />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the card', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <AccountCard
          onAccountSwitch={() => {}}
          color='purple'
          address='t0123456789'
          walletType='LEDGER'
          onShowOnLedger={() => {}}
          ledgerBusy={false}
          mb={2}
        />
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the card CREATE_MNEMONIC', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <AccountCard
          onAccountSwitch={() => {}}
          color='purple'
          address='t0123456789'
          walletType='CREATE_MNEMONIC'
          onShowOnLedger={() => {}}
          ledgerBusy={false}
          mb={2}
        />
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders the address', () => {
    render(
      <ThemeProvider theme={theme}>
        <AccountCard
          onAccountSwitch={() => {}}
          color='purple'
          address='t0123'
          walletType='LEDGER'
          onShowOnLedger={() => {}}
          ledgerBusy={false}
          mb={2}
        />
      </ThemeProvider>
    )

    expect(screen.getByText('t0123', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Your Address')).toBeInTheDocument()
  })

  test('clicking "Switch" calls onAccountSwitch', () => {
    const mockOnAccountSwitch = jest.fn()
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccountCard
          onAccountSwitch={mockOnAccountSwitch}
          color='purple'
          address='t0123'
          walletType='LEDGER'
          onShowOnLedger={() => {}}
          ledgerBusy={false}
          mb={2}
        />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByText('Switch'))
    })

    expect(mockOnAccountSwitch).toHaveBeenCalled()
  })

  test('clicking "Show on Device" calls onShowOnLedger', () => {
    const mockOnShowOnLedger = jest.fn()
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccountCard
          onAccountSwitch={() => {}}
          color='purple'
          address='t0123'
          walletType='LEDGER'
          onShowOnLedger={mockOnShowOnLedger}
          ledgerBusy={false}
          mb={2}
        />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByText('Show on Device'))
    })

    expect(mockOnShowOnLedger).toHaveBeenCalled()
  })

  test('clicking "Copy" calls copy', async () => {
    const mockCopyToClipboard = jest.fn(() => Promise.resolve('yo'))
    copyToClipboard.mockImplementationOnce(mockCopyToClipboard)

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <AccountCard
          onAccountSwitch={() => {}}
          color='purple'
          address='t0123'
          walletType='LEDGER'
          onShowOnLedger={() => {}}
          ledgerBusy={false}
          mb={2}
        />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(getByText('Copy'))
    })

    expect(mockCopyToClipboard).toHaveBeenCalled()
    expect(screen.getByText('Copied')).toBeInTheDocument()
  })
})
