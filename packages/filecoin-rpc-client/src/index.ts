import axios, { AxiosRequestConfig } from 'axios'

type Headers = Record<string, string | null | undefined>

export function removeEmptyHeaders(headers: Headers): Record<string, string> {
  const newHeaders: Record<string, string> = {}
  Object.keys(headers).forEach((key) => {
    if (headers[key]) newHeaders[key] = headers[key] as string
  })
  return newHeaders
}

export function configureHeaders(
  headers: Headers = {},
  token?: string,
): Record<string, string> {
  const reqHeaders: Headers = Object.assign({}, headers, { Accept: '*/*' })
  if (token) {
    reqHeaders.Authorization = `Bearer ${token}`
  }
  return removeEmptyHeaders(reqHeaders)
}

export function throwIfErrors(response: any): any {
  if (response.error) {
    if (response.error.message) throw new Error(response.error.message)
    else throw new Error('Unknown jsonrpc error')
  } else {
    return response
  }
}

export function deleteHeaders(opts: AxiosRequestConfig): AxiosRequestConfig {
  delete opts.headers
  return opts
}

export type LotusRpcEngineConfig = {
  apiAddress?: string
  token?: string
  axiosOpts?: AxiosRequestConfig
}

export default class LotusRpcEngine {
  readonly apiAddress: string
  readonly token?: string
  readonly axiosOpts: AxiosRequestConfig
  readonly headers: Record<string, string>

  constructor(config?: LotusRpcEngineConfig) {
    if (!config)
      throw new Error(
        'Must pass a config object to the LotusRpcEngine constructor.',
      )
    this.apiAddress = config.apiAddress || 'http://127.0.0.1:1234/rpc/v0'
    this.token = config.token
    this.headers = configureHeaders(config?.axiosOpts?.headers, config.token)
    this.axiosOpts = deleteHeaders(config.axiosOpts || {})
  }

  async request<A = any>(method: string, ...params: any[]): Promise<A> {
    const { data } = await axios.post(
      this.apiAddress,
      {
        jsonrpc: '2.0',
        method: `Filecoin.${method}`,
        params,
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
