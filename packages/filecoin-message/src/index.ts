import BigNumber from 'bignumber.js'
import { validateAddressString } from '@glif/filecoin-address'

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export interface ZondaxMessage {
  readonly to: string
  readonly from: string
  readonly nonce: number
  readonly value: string
  readonly gaspremium: string
  readonly gaslimit: number
  readonly gasfeecap: string
  readonly method: number
  readonly params: string | string[] | undefined
}

export type Address = {
  robust: string
  id: string
}

export type MessagePending = {
  cid: string
  from: Address
  gasFeeCap: string
  gasLimit: string
  gasPremium: string
  height: string
  method: string
  nonce: string
  params: string | string[]
  to: Address
  value: number
  version?: number
}

type SerializableMessage = ZondaxMessage

export interface LotusMessage {
  To: string
  From: string
  Nonce: number
  Value: string
  GasPremium: string
  GasLimit: number
  GasFeeCap: string
  Method: number
  Params?: string | string[]
}

export interface SignedLotusMessage {
  Message: LotusMessage
  Signature: {
    Type: number
    Data: string
  }
}

export interface MessageObj {
  to: string
  from: string
  nonce: number
  value: any
  method: number
  gasPremium?: string | number
  gasFeeCap?: string | number
  gasLimit?: number
  params?: string | string[]
}

export class Message {
  private to: string
  private from: string
  private nonce: number
  private method: number
  private value: BigNumber
  private gasPremium: BigNumber
  private gasFeeCap: BigNumber
  private gasLimit: number
  private params: string | string[] | undefined

  public constructor(msg: MessageObj) {
    typeCheck(msg)
    this.to = msg.to
    this.from = msg.from
    this.nonce = msg.nonce
    this.value = new BigNumber(msg.value)
    this.gasPremium = new BigNumber(msg.gasPremium || '0')
    this.gasFeeCap = new BigNumber(msg.gasFeeCap || '0')
    this.gasLimit = msg.gasLimit || 0
    this.method = msg.method
    this.params = msg.params
  }

  static fromZondaxType = ({
    to,
    from,
    nonce,
    value,
    gaspremium,
    gaslimit,
    gasfeecap,
    method,
    params
  }: ZondaxMessage): Message => {
    return new Message({
      to,
      from,
      nonce,
      value,
      gasPremium: gaspremium,
      gasLimit: gaslimit,
      gasFeeCap: gasfeecap,
      method,
      params
    })
  }

  static fromLotusType = ({
    To,
    From,
    Nonce,
    Value,
    GasPremium,
    GasLimit,
    GasFeeCap,
    Method,
    Params
  }: LotusMessage): Message => {
    return new Message({
      to: To,
      from: From,
      nonce: Nonce,
      value: Value,
      gasPremium: GasPremium,
      gasLimit: GasLimit,
      gasFeeCap: GasFeeCap,
      method: Method,
      params: Params
    })
  }

  public toLotusType = (): LotusMessage => {
    return {
      To: this.to,
      From: this.from,
      Nonce: this.nonce,
      Value: this.value.toFixed(0, 1),
      GasPremium: this.gasPremium.toFixed(0, 1),
      GasFeeCap: this.gasFeeCap.toFixed(0, 1),
      GasLimit: this.gasLimit,
      Method: this.method,
      Params: this.params
    }
  }

  public toSerializeableType = (): SerializableMessage => {
    return {
      to: this.to,
      from: this.from,
      nonce: this.nonce,
      value: this.value.toFixed(0, 1),
      gaspremium: this.gasPremium.toFixed(0, 1),
      gasfeecap: this.gasFeeCap.toFixed(0, 1),
      gaslimit: this.gasLimit,
      method: this.method,
      params: this.params
    }
  }

  public toZondaxType = (): ZondaxMessage => {
    return {
      to: this.to,
      from: this.from,
      nonce: this.nonce,
      value: this.value.toFixed(0, 1),
      gaspremium: this.gasPremium.toFixed(0, 1),
      gasfeecap: this.gasFeeCap.toFixed(0, 1),
      gaslimit: this.gasLimit,
      method: this.method,
      params: this.params || ''
    }
  }

  public toPendingMessage = (cid: string): MessagePending => {
    const toAddr: Address = {
      robust: '',
      id: ''
    }

    const fromAddr: Address = {
      robust: '',
      id: ''
    }
    if (this.to[1] === '0') toAddr.id = this.to
    else toAddr.robust = this.to

    if (this.from[1] === '0') fromAddr.id = this.from
    else fromAddr.robust = this.from
    return {
      to: toAddr,
      from: fromAddr,
      cid,
      method: this.method.toString(),
      gasFeeCap: this.gasFeeCap.toString(),
      gasLimit: this.gasLimit.toString(),
      gasPremium: this.gasPremium.toString(),
      params: this.params || '',
      height: '',
      // this could become problematic with big numbers...
      value: this.value.toNumber(),
      nonce: this.nonce.toString()
    }
  }
}

const typeCheck = (msg: MessageObj): void => {
  if (!msg.to) throw new Error('No to address provided')
  if (!msg.from) throw new Error('No from address provided')

  if (!validateAddressString(msg.to))
    throw new Error('Invalid to address provided')
  if (!validateAddressString(msg.from))
    throw new Error('Invalid from address provided')

  if (!msg.nonce && msg.nonce !== 0) throw new Error('No nonce provided')
  if (typeof msg.nonce !== 'number') throw new Error('Nonce is not a number')
  if (!(msg.nonce <= Number.MAX_SAFE_INTEGER))
    throw new Error('Nonce must be smaller than Number.MAX_SAFE_INTEGER')

  if (!msg.value) throw new Error('No value provided')

  if (msg.gasLimit && typeof msg.gasLimit !== 'number')
    throw new Error('Gas limit is not a number')
  if (msg.gasLimit && !(msg.gasLimit <= Number.MAX_SAFE_INTEGER))
    throw new Error('Gas limit must be smaller than Number.MAX_SAFE_INTEGER')

  if (!msg.method && msg.method !== 0) throw new Error('No method provided')
  if (typeof msg.method !== 'number') throw new Error('Method is not a number')
  if (!(msg.method <= Number.MAX_SAFE_INTEGER))
    throw new Error('Method must be smaller than Number.MAX_SAFE_INTEGER')
}

export default {
  Message
}
