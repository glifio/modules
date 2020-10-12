jest.mock('@glif/filecoin-rpc-client')
const axios = require('axios')
const confirm = require('../src').default
const RpcClient = require('@glif/filecoin-rpc-client').default
describe('message confirmer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  test('it returns true when a message is confirmed', async () => {
    RpcClient.mockImplementation(() => {
      return {
        request: () =>
          Promise.resolve({
            Receipt: {
              ExitCode: 0
            }
          })
      }
    })
    const confirmed = await confirm(
      'bafy2bzacebnyjf5oxzvts5f4ifqgee2yrqb7epdepnw3y2yk25ju5su2episg'
    )
    expect(confirmed).toBeTruthy()
    jest.runAllTimers()
  })

  test('it returns true when a message confirms during the confirmation polling', async () => {
    RpcClient.mockImplementationOnce(() => {
      return {
        request: () => {
          // simulate a cancelled call bc of timeout
          throw new axios.Cancel()
        }
      }
    }).mockImplementationOnce(() => {
      return {
        request: () => ({
          Receipt: {
            ExitCode: 0
          }
        })
      }
    })
    const confirmed = await confirm(
      'bafy2bzacebnyjf5oxzvts5f4ifqgee2yrqb7epdepnw3y2yk25ju5su2episg'
    )
    jest.runAllTimers()
    expect(confirmed).toBeTruthy()
  })

  test('it returns false when a message does not confirm in the number of retries', async () => {
    RpcClient.mockImplementation(() => {
      return {
        request: () => {
          // simulate a cancelled call bc of timeout
          throw new axios.Cancel()
        }
      }
    })
    const confirmed = await confirm(
      'bafy2bzacebnyjf5oxzvts5f4ifqgee2yrqb7epdepnw3y2yk25ju5su2episg'
    )
    jest.runAllTimers()
    expect(confirmed).toBeFalsy()
  })

  test('it returns false when a message has a non-zero exit code', async () => {
    RpcClient.mockImplementation(() => {
      return {
        request: () => {
          return {
            Receipt: {
              ExitCode: 2
            }
          }
        }
      }
    })
    const confirmed = await confirm(
      'bafy2bzacebnyjf5oxzvts5f4ifqgee2yrqb7epdepnw3y2yk25ju5su2episg'
    )
    jest.runAllTimers()
    expect(confirmed).toBeFalsy()
  })
})
