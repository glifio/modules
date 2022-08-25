export type ActorName = string
export type ActorCode = string
export type MethodNum = string
export type NetworkName = string
export type PropName = string

export type ActorCodeMap = {
  [actorName: ActorName]: ActorCode
}

export type NetworkActorCodeMap = {
  [networkName: NetworkName]: ActorCodeMap
}

export enum Type {
  Bool = "bool",
  Number = "number",
  String = "string",
  Map = "map",
  Array = "array",
  Chan = "channel",
  Object = "object",
  Function = "function",
  Interface = "interface"
}

export type DataType = {
  Type: string
  Name: string
  Key?: DataType
  Contains?: DataType
  Children?: DataTypeMap
  Methods?: DataTypeMap
  Params?: DataType[]
  Returns?: DataType[]
  IsVariadic?: boolean
  ChanDir?: string
}

export type DataTypeMap = {
  [name: PropName]: DataType
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
