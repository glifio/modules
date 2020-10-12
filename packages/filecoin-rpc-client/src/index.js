import axios from 'axios'

export const removeEmptyHeaders = headers => {
  const newHeaders = {}
  Object.keys(headers).forEach(key => {
    if (headers[key]) newHeaders[key] = headers[key]
  })
  return newHeaders
}

export const configureHeaders = (headers = {}, token) => {
  const reqHeaders = Object.assign({}, headers)
  return removeEmptyHeaders({
    Accept: '*/*',
    Authorization: token ? `Bearer ${token}` : null,
    ...reqHeaders,
  })
}

export const throwIfErrors = response => {
  if (response.error) {
    if (response.error.message) throw new Error(response.error.message)
    else throw new Error('Unknown jsonrpc error')
  } else {
    return response
  }
}

export const deleteHeaders = opts => {
  delete opts.headers
  return opts
}

class LotusRpcEngine {
  constructor(config) {
    if (!config)
      throw new Error(
        'Must pass a config object to the LotusRpcEngine constructor.',
      )
    this.apiAddress = config.apiAddress || 'http://127.0.0.1:1234/rpc/v0'
    this.token = config.token
    this.headers = configureHeaders(config?.axiosOpts?.headers, config.token)
    this.axiosOpts = deleteHeaders(config.axiosOpts || {})
  }

  async request(method, ...params) {
    const { data } = await axios.post(
      this.apiAddress,
      {
        jsonrpc: '2.0',
        method: `Filecoin.${method}`,
        params: [...params],
        id: 1,
      },
      {
        headers: this.headers,
        ...this.axiosOpts,
      },
    )
    throwIfErrors(data)
    return data.result
  }
}

export default LotusRpcEngine
