import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'

export const removeEmptyHeaders = (
  headers: AxiosRequestHeaders
): AxiosRequestHeaders =>
  Object.fromEntries(Object.entries(headers).filter(([_key, value]) => !!value))

export const getHeaders = (
  headers?: AxiosRequestHeaders,
  token?: string
): AxiosRequestHeaders => ({
  ...headers,
  Accept: '*/*',
  'Content-Type': 'application/json',
  ...(token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {})
})

export const throwIfErrors = (data: any) => {
  if (data.error) {
    if (data.error.message) throw new Error(data.error.message)
    throw new Error(`JSON-RPC error: ${JSON.stringify(data.error)}`)
  }
}

export type LotusRpcEngineConfig = {
  apiAddress: string
  token?: string
  axiosOpts?: AxiosRequestConfig
}

export default class LotusRpcEngine {
  readonly apiAddress: string
  readonly axiosOpts: AxiosRequestConfig

  constructor(config: LotusRpcEngineConfig) {
    if (!config)
      throw new Error(
        'Must pass a config object to the LotusRpcEngine constructor.'
      )
    this.apiAddress = config.apiAddress
    this.axiosOpts = config.axiosOpts || {}
    this.axiosOpts.headers = getHeaders(this.axiosOpts.headers, config.token)
    this.axiosOpts.headers = removeEmptyHeaders(this.axiosOpts.headers)
  }

  async request<A = any>(method: string, ...params: any[]): Promise<A> {
    const { data } = await axios.post(
      this.apiAddress,
      {
        jsonrpc: '2.0',
        method: `Filecoin.${method}`,
        params,
        id: 1
      },
      this.axiosOpts
    )
    throwIfErrors(data)
    return data.result
  }
}
