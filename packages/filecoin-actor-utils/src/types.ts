export type ActorName = string
export type ActorCode = string
export type MethodNum = string
export type NetworkName = string
export type PropName = string

export type ActorCodeMap = {
  [actorName: ActorName]: ActorCode
}

export type ActorCodeMapInv = {
  [actorCode: ActorCode]: ActorName
}

export type NetworkActorCodeMap = {
  [networkName: NetworkName]: ActorCodeMap
}

export type NetworkActorCodeMapInv = {
  [networkName: NetworkName]: ActorCodeMapInv
}

export enum Type {
  Bool = 'boolean',
  Number = 'number',
  String = 'string',
  Map = 'map',
  Array = 'array',
  Chan = 'channel',
  Object = 'object',
  Function = 'function',
  Interface = 'interface'
}

export type DataType = {
  Type: Type
  Name: string
  Value?: boolean | string | number | Array<boolean | string | number>
  Key?: DataType // For map type
  Contains?: DataType // For map / array / channel type
  Children?: DataTypeMap // For object type
  Methods?: DataTypeMap // For interface type
  Params?: DataType[] // For function type
  Returns?: DataType[] // For function type
  IsVariadic?: boolean // For function type
  ChanDir?: string // For channel type
}

export type DataTypeMap = {
  [propName: PropName]: DataType
}

export type ActorMethod = {
  Name: string
  Param: DataType
  Return: DataType
}

export type ActorMethodMap = {
  [methodNum: MethodNum]: ActorMethod
}

export type ActorDescriptor = {
  State: DataTypeMap
  Methods: ActorMethodMap
}

export type ActorDescriptorMap = {
  [actorName: ActorName]: ActorDescriptor
}

export type LotusCID = {
  '/': string
}

export type LotusActorState<T = Record<string, any> | null> = {
  Balance: string
  Code: LotusCID
  State: T
}
