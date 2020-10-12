const confirm = require('../src').default

describe('message confirmer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  test('it returns true when a message is confirmed', async () => {
    const confirmed = await confirm(
      'bafy2bzacebnyjf5oxzvts5f4ifqgee2yrqb7epdepnw3y2yk25ju5su2episg'
    )
    expect(confirmed).toBeTruthy()
    jest.runAllTimers()
  })
})
