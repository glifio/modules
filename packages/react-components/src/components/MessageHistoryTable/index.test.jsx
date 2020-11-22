import { cleanup, render, screen, act, fireEvent } from '@testing-library/react'
import { BigNumber } from '@glif/filecoin-number'
import MessageHistoryTable from './index'
import theme from '../theme'
import ThemeProvider from '../ThemeProvider'
import { filfoxMockData } from '../../test-utils/mockData'
import { formatFilfoxMessages } from '../../lib/useTransactionHistory/formatMessages'
import noop from '../../utils/noop'
import makeFriendlyBalance from '../../utils/makeFriendlyBalance'

describe('MessageHistoryTable', () => {
  afterEach(cleanup)
  let setSelectedMessageCid = jest.fn()
  let showMore = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
    setSelectedMessageCid = jest.fn()
    showMore = jest.fn()
  })

  test('renders the MessageHistoryTable', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={formatFilfoxMessages(filfoxMockData).map(msg => ({
            ...msg,
            status: 'confirmed',
            params: { foo: 'bar' }
          }))}
          loading={false}
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={filfoxMockData.length}
          refresh={noop}
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
    expect(screen.getByText('Transaction History')).toBeInTheDocument()
  })

  test('renders the loading screen when loading is true', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={formatFilfoxMessages(filfoxMockData).map(msg => ({
            ...msg,
            status: 'confirmed',
            params: { foo: 'bar' }
          }))}
          loading
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={16}
          refresh={noop}
        />
      </ThemeProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('renders the empty history component when messages are empty', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={[]}
          loading={false}
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={0}
          refresh={noop}
        />
      </ThemeProvider>
    )

    expect(
      screen.getByText('How do I see my transaction history?')
    ).toBeInTheDocument()
  })

  test('renders the show more button when the total is larger than # of messages in the table', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={formatFilfoxMessages(filfoxMockData).map(msg => ({
            ...msg,
            status: 'confirmed',
            params: { foo: 'bar' }
          }))}
          loading={false}
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={16}
          refresh={noop}
        />
      </ThemeProvider>
    )

    expect(screen.getByText('View More')).toBeInTheDocument()
  })

  test("doesn't render the show more button when the total is larger than # of messages in the table", () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={formatFilfoxMessages(filfoxMockData).map(msg => ({
            ...msg,
            status: 'confirmed',
            params: { foo: 'bar' }
          }))}
          loading={false}
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={filfoxMockData.length}
          refresh={noop}
        />
      </ThemeProvider>
    )

    let error
    try {
      screen.getByText('View More')
    } catch (e) {
      error = e
    }

    expect(error).toBeTruthy()
  })

  test('renders value of first message', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={formatFilfoxMessages(filfoxMockData).map(msg => ({
            ...msg,
            status: 'confirmed',
            params: { foo: 'bar' }
          }))}
          loading={false}
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={filfoxMockData.length}
          refresh={noop}
        />
      </ThemeProvider>
    )

    const friendlyValue = makeFriendlyBalance(
      new BigNumber(filfoxMockData[0].value)
    )

    expect(screen.getAllByText(friendlyValue)).toBeTruthy()
  })

  test('shows a refresh tx history button', () => {
    render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={formatFilfoxMessages(filfoxMockData).map(msg => ({
            ...msg,
            status: 'confirmed',
            params: { foo: 'bar' }
          }))}
          loading={false}
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={filfoxMockData.length}
          refresh={noop}
        />
      </ThemeProvider>
    )

    expect(screen.getAllByText('Refresh')).toBeTruthy()
  })

  test('shows a refresh tx history button', () => {
    const spy = jest.fn()
    render(
      <ThemeProvider theme={theme}>
        <MessageHistoryTable
          address='t01'
          messages={formatFilfoxMessages(filfoxMockData).map(msg => ({
            ...msg,
            status: 'confirmed',
            params: { foo: 'bar' }
          }))}
          loading={false}
          selectMessage={setSelectedMessageCid}
          paginating={false}
          showMore={showMore}
          total={filfoxMockData.length}
          refresh={spy}
        />
      </ThemeProvider>
    )

    act(() => {
      fireEvent.click(screen.getByText('Refresh'))
    })

    expect(spy).toHaveBeenCalled()
  })
})
