import RpcClient from '@glif/filecoin-rpc-client'
import axios from 'axios'

type CID = string

interface ConfirmerConfig {
  apiAddress: string
  token?: string
  // the amount of time to timeout the request
  timeoutAfter?: number
  // the number of times this function calls itself, recursively
  totalRetries?: number
}

// 75 seconds is the default timeout, so we always capture 2 blocks regardless of when it happened (credit to Riba from PL)
const defaultTimeout = 90000
const defaultTotalRetries = 5

const defaultConfig: ConfirmerConfig = {
  apiAddress: 'https://api.node.glif.io',
  timeoutAfter: defaultTimeout,
  totalRetries: defaultTotalRetries
}

const STATE_SEARCH_MESSAGE = 'StateSearchMsg'

const createCancelToken = (timeoutAfter: number = defaultTimeout) =>
  new axios.CancelToken(c => setTimeout(c, timeoutAfter))

const confirmMessage = async (
  msgCid: CID,
  config: ConfirmerConfig = defaultConfig
): Promise<boolean> => {
  let retries = 0
  const confirm = async (): Promise<boolean> => {
    const cancelToken = createCancelToken(config.timeoutAfter)
    const rpcClient = new RpcClient({
      apiAddress: config.apiAddress,
      token: config.token,
      axiosOpts: { cancelToken }
    })

    try {
      const res = await rpcClient.request(STATE_SEARCH_MESSAGE, {
        '/': msgCid
      })

      if (res && res.Receipt.ExitCode === 0) return true
      return false
    } catch (err) {
      if (
        err instanceof axios.Cancel &&
        retries < (config.totalRetries || defaultTotalRetries)
      ) {
        retries++
        return confirm()
      }
      return false
    }
  }

  return confirm()
}

export default confirmMessage
