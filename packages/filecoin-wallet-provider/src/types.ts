export interface CID {
  '/': string
}

export interface MessageReceipt {
  ExitCode: number
  GasUsed: number
  Return: string | null
}

export interface InvokedMessage {
  To: string
  From: string
  Nonce: number
  Value: string
  GasPremium: string
  GasLimit: number
  GasFeeCap: string
  Method: number
  Params: string | string[]
  Version: number
  CID: CID
}

export interface Subcall {
  Msg: InvokedMessage
  MsgRct: MessageReceipt
  Error: string
  Duration: number
  GasCharges: any
  Subcalls: Subcall[] | null
}

export interface ExecutionTrace {
  Msg: InvokedMessage
  MsgRct: MessageReceipt
  Error: string
  Duration: number
  GasCharges: any
  Subcalls: Subcall[] | null
}

export interface InvocResult {
  MsgRct: MessageReceipt
  Msg: InvokedMessage
  MsgCid: CID
  Error: string
  Duration: number
  GasCost: object
  ExecutionTrace: ExecutionTrace
  GasCharges?: any
}

export type WalletType = 'SINGLE_KEY' | 'HD_WALLET' | 'LEDGER'

export type SemanticVersion = {
  major: number
  minor: number
  patch: number
}
