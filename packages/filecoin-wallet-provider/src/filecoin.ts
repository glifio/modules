import LotusRpcEngine, { LotusRpcEngineConfig } from '@glif/filecoin-rpc-client'
import { FilecoinNumber } from '@glif/filecoin-number'
import { checkAddressString } from '@glif/filecoin-address'
import {
  computeGasToBurn,
  KNOWN_TYPE_0_ADDRESS,
  KNOWN_TYPE_1_ADDRESS,
  KNOWN_TYPE_3_ADDRESS,
  allCallsExitWithCode0,
} from './utils'
import { BigNumber } from 'bignumber.js'
import { WalletSubProvider } from './wallet-sub-provider'
import { LotusMessage, Message } from '@glif/filecoin-message'
import { Network } from '@glif/filecoin-address'
import { InvocResult, CID } from './types'

export class Filecoin {
  public wallet: WalletSubProvider
  public jsonRpcEngine: LotusRpcEngine

  constructor(
    provider: WalletSubProvider,
    config: LotusRpcEngineConfig = {
      apiAddress: 'http://127.0.0.1:1234/rpc/v0',
    },
  ) {
    if (!provider) throw new Error('No provider provided.')
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine(config)
  }

  getBalance = async (address: string): Promise<FilecoinNumber> => {
    checkAddressString(address)
    const balance = await this.jsonRpcEngine.request<string>(
      'WalletBalance',
      address,
    )
    return new FilecoinNumber(balance, 'attofil')
  }

  simulateMessage = async (message: LotusMessage): Promise<boolean> => {
    const res = await this.jsonRpcEngine.request<InvocResult>(
      'StateCall',
      message,
      null,
    )
    return allCallsExitWithCode0(res)
  }

  sendMessage = async (
    message: LotusMessage,
    signature: string,
  ): Promise<CID> => {
    if (!message) throw new Error('No message provided.')
    if (!signature) throw new Error('No signature provided.')
    const signedMessage = {
      Message: message,
      Signature: {
        // wallet only supports secp256k1 keys for now
        Type: 1,
        Data: signature,
      },
    }

    return this.jsonRpcEngine.request<{ '/': string }>(
      'MpoolPush',
      signedMessage,
    )
  }

  getNonce = async (address: string): Promise<number> => {
    if (!address) throw new Error('No address provided.')
    checkAddressString(address)
    try {
      const nonce = Number(
        await this.jsonRpcEngine.request('MpoolGetNonce', address),
      )
      return nonce
    } catch (err) {
      if (
        err &&
        err.message &&
        err.message.toLowerCase().includes('actor not found')
      )
        return 0
      throw new Error(err)
    }
  }

  cloneMsgWOnChainFromAddr = async (
    message: LotusMessage,
  ): Promise<LotusMessage> => {
    const clonedMsg = Object.assign({}, message)
    try {
      // state call errs if the from address does not exist on chain yet, lookup from actor ID to know this for sure
      await this.jsonRpcEngine.request('StateLookupID', clonedMsg.From, null)
    } catch (err) {
      // if from actor doesnt exist, use a hardcoded known actor address
      if (err.message.toLowerCase().includes('actor not found')) {
        const networkPrefix = clonedMsg.From[0] as Network

        if (!clonedMsg.From)
          clonedMsg.From = KNOWN_TYPE_0_ADDRESS[networkPrefix]
        if (clonedMsg.From[1] === '0')
          clonedMsg.From = KNOWN_TYPE_0_ADDRESS[networkPrefix]
        else if (clonedMsg.From[1] === '1')
          clonedMsg.From = KNOWN_TYPE_1_ADDRESS[networkPrefix]
        else if (clonedMsg.From[1] === '3')
          clonedMsg.From = KNOWN_TYPE_3_ADDRESS[networkPrefix]
        else {
          // this should never happen, only t1 and t3 addresses can be used as a from?
          clonedMsg.From = KNOWN_TYPE_0_ADDRESS[networkPrefix]
        }
      }
    }
    return clonedMsg
  }

  gasEstimateFeeCap = async (
    message: LotusMessage,
  ): Promise<FilecoinNumber> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)
    const feeCap = await this.jsonRpcEngine.request<string>(
      'GasEstimateFeeCap',
      clonedMsg,
      0,
      null,
    )

    return new FilecoinNumber(feeCap, 'attofil')
  }

  gasEstimateGasLimit = async (
    message: LotusMessage,
  ): Promise<FilecoinNumber> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)

    const gasLimit = await this.jsonRpcEngine.request<string>(
      'GasEstimateGasLimit',
      clonedMsg,
      null,
    )

    return new FilecoinNumber(gasLimit, 'attofil')
  }

  gasEstimateGasPremium = async (
    message: LotusMessage,
    numBlocksIncluded: number = 0,
  ): Promise<FilecoinNumber> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)

    const gasPremium = await this.jsonRpcEngine.request<string>(
      'GasEstimateGasPremium',
      numBlocksIncluded,
      clonedMsg.From,
      clonedMsg.GasLimit || 0,
      null,
    )

    return new FilecoinNumber(gasPremium, 'attofil')
  }

  gasEstimateMessageGas = async (
    message: LotusMessage,
    maxFee: string = '0',
  ): Promise<Message> => {
    if (!message) throw new Error('No message provided.')
    const clonedMsg = await this.cloneMsgWOnChainFromAddr(message)
    const {
      To,
      Value,
      GasPremium,
      GasFeeCap,
      GasLimit,
      Method,
      Nonce,
      Params,
    } = await this.jsonRpcEngine.request(
      'GasEstimateMessageGas',
      clonedMsg,
      { MaxFee: maxFee },
      null,
    )

    // this is a hack to get by weird UI bugs where f addresses convert to t addresses
    const toAddressWithCorrectPrefix = clonedMsg.To[0] + To.slice(1)
    return new Message({
      to: toAddressWithCorrectPrefix,
      from: message.From,
      value: Value,
      gasPremium: GasPremium,
      gasFeeCap: GasFeeCap,
      gasLimit: GasLimit,
      method: Method,
      nonce: Nonce,
      params: Params,
    })
  }

  gasEstimateMaxFee = async (
    message: LotusMessage,
  ): Promise<{ maxFee: FilecoinNumber; message: LotusMessage }> => {
    const msgWithGas = (await this.gasEstimateMessageGas(message)).toLotusType()
    const feeCap = new BigNumber(msgWithGas.GasFeeCap)
    const limit = new BigNumber(msgWithGas.GasLimit)
    return {
      maxFee: new FilecoinNumber(feeCap.times(limit), 'attofil'),
      message: msgWithGas,
    }
  }

  /**
   * formula (some of these variable names might not be the best...):
   * (GasUsed+GasToBurn)*min(BaseFee, FeeCap)+GasLimit*max(0, min(FeeCap-BaseFee, GasPremium)))
   *
   * minBaseFeeFeeCap = min(BaseFee, FeeCap)
   * totalGas = GasUsed+GasToBurn
   * leftSide = totalGas*minBaseFeeFeeCap
   *
   * minTip = min(FeeCap-BaseFee, GasPremium)
   * rightSide = gasLimit*max(0, minTip)
   *
   * paidByMessageSender =
   * leftSide + rightSide
   */
  gasCalcTxFee = async (
    gasFeeCap: string,
    gasPremium: string,
    gasLimit: number,
    baseFee: string,
    gasUsed: string,
  ): Promise<FilecoinNumber> => {
    const gasFeeCapBN = new BigNumber(gasFeeCap)
    const gasPremiumBN = new BigNumber(gasPremium)
    const gasLimitBN = new BigNumber(gasLimit)
    const baseFeeBN = new BigNumber(baseFee)
    const gasUsedBN = new BigNumber(gasUsed)

    /* compute left side */
    const gasToBurn = computeGasToBurn(gasUsedBN, gasLimitBN)
    const totalGas = gasUsedBN.plus(gasToBurn)
    const minBaseFeeFeeCap = BigNumber.minimum(baseFeeBN, gasFeeCapBN)
    const leftSide = totalGas.times(minBaseFeeFeeCap)

    /* compute right side */
    const minTip = BigNumber.minimum(gasFeeCapBN.minus(baseFeeBN), gasPremiumBN)
    const rightSide = gasLimitBN.times(BigNumber.maximum(0, minTip))

    return new FilecoinNumber(leftSide.plus(rightSide), 'attofil')
  }
}
