import nock from 'nock'
import LotusRpcEngine, {
  getHeaders,
  removeEmptyHeaders,
  throwIfErrors
} from '../index'

const successfulResponse = {
  jsonrpc: '2.0',
  result: 'fake response result',
  id: 1
}

const errorResponse = {
  jsonrpc: '2.0',
  result: '\u003cnil\u003e',
  id: 1,
  error: {
    code: 1,
    message: 'get actor: GetActor called on undefined address'
  }
}

jest.setTimeout(50000)

describe('removeEmptyHeaders', () => {
  test('it should return an object without keys that are set to falsey values', () => {
    const headers = {
      'Content-Type': 'text/plain;charset=UTF-8',
      Test: 'value',
      Accept: '',
      Authorization: ''
    }

    expect(removeEmptyHeaders(headers).Accept).toBeUndefined()
    expect(removeEmptyHeaders(headers).Authorization).toBeUndefined()
    expect(removeEmptyHeaders(headers)['Content-Type']).toBeTruthy()
    expect(removeEmptyHeaders(headers).Test).toBeTruthy()
  })
})

describe('getHeaders', () => {
  test('it should return Accept */* and application/json Content-Type', () => {
    const headers = {}

    expect(getHeaders(headers).Accept).toBe('*/*')
    expect(getHeaders(headers)['Content-Type']).toBe('application/json')
  })
})

describe('throwIfErrors', () => {
  test('it returns responses with no errors', () => {
    expect(() => throwIfErrors(successfulResponse)).not.toThrow()
  })

  test('it throws a descriptive error if the jsonrpc response comes back with an error', () => {
    expect(() => throwIfErrors(errorResponse)).toThrow(
      errorResponse.error.message
    )
  })
})

describe('LotusRpcEngine', () => {
  test('it throws an error if no apiAddress is passed to constructor', () => {
    // @ts-ignore
    const instantiateLotusRpcEngine = () => new LotusRpcEngine()
    expect(instantiateLotusRpcEngine).toThrow()
  })

  describe('request', () => {
    const lotus = new LotusRpcEngine({
      apiAddress: 'https://proxy.openworklabs.com/rpc/v0'
    })

    test('it passes the first argument as the jsonrpc method', done => {
      const method = 'ChainHead'
      nock('https://proxy.openworklabs.com')
        .post('/rpc/v0')
        .reply(201, (uri, body) => {
          if (typeof body !== 'string') {
            expect(body.method).toBe(`Filecoin.${method}`)
          } else {
            throw new Error(`Body should be Record`)
          }
          done()
        })

      lotus.request(method)
    })

    test('passes the subsequent arguments as the jsonrpc params', done => {
      const method = 'FakeJsonRpcMethodWithMultipleParams'
      const param1 = 't1mbk7q6gm4rjlndfqw6f2vkfgqotres3fgicb2uq'
      const param2 = 'RIP Kobe.'
      nock('https://proxy.openworklabs.com')
        .post('/rpc/v0')
        .reply(201, (uri, body) => {
          if (typeof body !== 'string') {
            expect(body.params[0]).toBe(param1)
            expect(body.params[1]).toBe(param2)
          } else {
            throw new Error(`Body should be Record`)
          }
          done()
        })

      lotus.request(method, param1, param2)
    })

    test('returns the result when response is successful', async () => {
      const method = 'FakeMethod'
      nock('https://proxy.openworklabs.com')
        .post('/rpc/v0')
        .reply(201, () => {
          return successfulResponse
        })

      const response = await lotus.request(method)
      expect(response).toBe(successfulResponse.result)
    })

    test('throws an error with the error message when response is unsuccessful', async () => {
      const method = 'FakeMethod'
      nock('https://proxy.openworklabs.com')
        .post('/rpc/v0')
        .reply(201, () => errorResponse)

      await expect(lotus.request(method)).rejects.toThrow(
        errorResponse.error.message
      )
    })

    test('it properly sends requests to the eth namespace', done => {
      const ethNamespace = new LotusRpcEngine({
        apiAddress: 'https://proxy.openworklabs.com/rpc/v0',
        namespace: 'eth',
        delimeter: '_'
      })
      const method = 'getTransactionCount'
      nock('https://proxy.openworklabs.com')
        .post('/rpc/v0')
        .reply(201, (uri, body) => {
          if (typeof body !== 'string') {
            expect(body.method).toBe(`eth_${method}`)
          } else {
            throw new Error(`Body should be Record`)
          }
          done()
        })

      ethNamespace.request(method)
    })
  })
})
