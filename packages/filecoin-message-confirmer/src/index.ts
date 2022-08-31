import RpcClient from '@glif/filecoin-rpc-client'
import axios from 'axios'

type CID = string

interface ConfirmerConfig {
  apiAddress?: string
  token?: string
  // the amount of time to timeout the request
  timeoutAfter?: number
  // the number of times this function calls itself, recursively
  totalRetries?: number
}

// 75 seconds is the default timeout, so we always capture 2 blocks regardless of when it happened (credit to Riba from PL)
const defaultTimeout = 90000
const defaultTotalRetries = Infinity

const defaultConfig: Required<ConfirmerConfig> = {
  apiAddress: 'https://api.node.glif.io',
  timeoutAfter: defaultTimeout,
  totalRetries: defaultTotalRetries,
  token: ''
}

const STATE_SEARCH_MESSAGE = 'StateSearchMsg'

const createCancelToken = (timeoutAfter: number) =>
  new axios.CancelToken(c => setTimeout(c, timeoutAfter))

const sleep = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time))

const confirmMessage = async (
  msgCid: CID,
  config: ConfirmerConfig = defaultConfig
): Promise<boolean> => {
  let retries = 0
  const timeoutAfter = config.timeoutAfter || defaultTimeout
  const confirm = async (): Promise<boolean> => {
    const cancelToken = createCancelToken(timeoutAfter)
    const rpcClient = new RpcClient({
      apiAddress: config.apiAddress || defaultConfig.apiAddress,
      token: config.token,
      axiosOpts: { cancelToken }
    })

    try {
      const res = await rpcClient.request(STATE_SEARCH_MESSAGE, {
        '/': msgCid
      })

      if (res?.Receipt?.ExitCode === 0) return true
      if (res?.Receipt?.ExitCode && res.Receipt.ExitCode !== 0)
        throw new Error('Message failed to execute on chain.')

      await sleep(timeoutAfter)
      retries++
      return confirm()
    } catch (err) {
      if (retries > (config.totalRetries || defaultTotalRetries)) {
        return false
      }

      if (err instanceof axios.Cancel) {
        retries++
        return confirm()
      }

      if (err instanceof Error && err.message.includes('block not found')) {
        await sleep(timeoutAfter)
        retries++
        return confirm()
      }
      return false
    }
  }

  return confirm()
}

export default confirmMessage
