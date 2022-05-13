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
  params: string | string[] | undefined
  to: Address
  value: string
  version?: string
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
  method: number
  value: string | number | BigNumber
  gasPremium?: string | number | BigNumber
  gasFeeCap?: string | number | BigNumber
  gasLimit?: number
  params?: string | string[]
}

export class Message {
  private _to: string
  private _from: string
  private _nonce: number
  private _method: number
  private _value: BigNumber
  private _gasPremium: BigNumber
  private _gasFeeCap: BigNumber
  private _gasLimit: number
  private _params: string | string[] | undefined

  public get to(): string {
    return this._to
  }

  public get from(): string {
    return this._from
  }

  public get nonce(): number {
    return this._nonce
  }

  public get method(): number {
    return this._method
  }

  public get value(): BigNumber {
    return this._value
  }

  public get gasPremium(): BigNumber {
    return this._gasPremium
  }

  public get gasFeeCap(): BigNumber {
    return this._gasFeeCap
  }

  public get gasLimit(): number {
    return this._gasLimit
  }

  public get params(): string | string[] | undefined {
    return this._params
  }

  public constructor(msg: MessageObj) {
    typeCheck(msg)
    this._to = msg.to
    this._from = msg.from
    this._nonce = msg.nonce
    this._value = new BigNumber(msg.value)
    this._gasPremium = new BigNumber(msg.gasPremium || 0)
    this._gasFeeCap = new BigNumber(msg.gasFeeCap || 0)
    this._gasLimit = msg.gasLimit || 0
    this._method = msg.method
    this._params = msg.params
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
      value: this.value.toString(),
      nonce: this.nonce.toString()
    }
  }
}

const typeCheck = (msg: MessageObj): void => {
  if (typeof msg === 'undefined')
    throw new Error(`Message configuration object not provided`)

  if (typeof msg !== 'object' || msg === null)
    throw new Error(`Message configuration object not valid`)

  checkAddressString(msg.to, 'To Address')
  checkAddressString(msg.from, 'From Address')
  checkPositiveNumber(msg.nonce, 'Nonce')
  checkPositiveNumber(msg.method, 'Method')
  checkBigNumberValue(msg.value, 'Value')
  if (msg.gasPremium)
    checkBigNumberValue(msg.gasPremium, 'Gas Premium')
  if (msg.gasFeeCap)
    checkBigNumberValue(msg.gasFeeCap, 'Gas Fee Cap')
  if (msg.gasLimit)
    checkPositiveNumber(msg.gasLimit, 'Gas Limit')
}

const checkAddressString = (value: any, name: string): void => {
  if (typeof value === 'undefined')
    throw new Error(`No value provided for ${name}`)
  if (typeof value !== 'string')
    throw new Error(`Value provided for ${name} is not a string`)
  if (!validateAddressString(value))
    throw new Error(`Value provided for ${name} is not a valid address`)
}

const checkBigNumberValue = (value: any, name: string): void => {
  switch (typeof value) {
    case 'undefined':
      throw new Error(`No value provided for ${name}`)
    case 'number':
      return checkPositiveNumber(value, name)
    case 'string':
      return checkPositiveNumber(Number(value), name)
    case 'object':
      if (value === null)
        throw new Error(`Value provided for ${name} is null`)
      if (!('_isBigNumber' in value))
        throw new Error(`Value provided for ${name} is an object, but not a BigNumber`)
      return
    default:
      throw new Error(`Value provided for ${name} is not a number or string`)
  }
}

const checkPositiveNumber = (value: any, name: string): void => {
  if (typeof value === 'undefined')
    throw new Error(`No value provided for ${name}`)
  if (typeof value !== 'number')
    throw new Error(`Value provided for ${name} is not a number`)
  if (isNaN(value))
    throw new Error(`Value provided for ${name} is NaN`)
  if (value < 0)
    throw new Error(`Value provided for ${name} cannot be lower than 0`)
  if (value > Number.MAX_SAFE_INTEGER)
    throw new Error(`Value provided for ${name} cannot be higher than ${Number.MAX_SAFE_INTEGER}`)
}

export default {
  Message
}
