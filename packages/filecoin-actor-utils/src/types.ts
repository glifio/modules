export type ActorName = string
export type ActorCode = string
export type MethodNum = number
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
  Bytes = 'bytes',
  Map = 'map',
  Array = 'array',
  Chan = 'channel',
  Object = 'object',
  Function = 'function',
  Interface = 'interface'
}

export type BaseValue = boolean | string | number

export type DataType = {
  Type: Type
  Name: string
  Value?: BaseValue // For described boolean, number or string types
  Values?: DataType[] // For described array types
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
  State: DataTypeMap | null
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

/**
 * DataType examples
 * 

const bool = {
  Type: Type.Bool,
  Name: 'bool',
  Value: true             // When described
}

const number = {
  Type: Type.Number,
  Name: 'uint64',
  Value: 256              // When described
}

const string = {
  Type: Type.String,
  Name: 'Address',
  Value: 'f01'            // When described
}

const bytes = {
  Type: Type.Bytes,
  Name: '',
  Value: 'dGVzdA=='       // When described
}

const array = {
  Type: Type.Array,
  Name: '',
  Contains: {
    Type: Type.String,
    Name: 'Address'
  }
  Values: [               // When described
    {
      Type: Type.String,
      Name: 'Address',
      Value: 'f01'
    },
    {
      Type: Type.String,
      Name: 'Address',
      Value: 'f02'
    },
    {
      Type: Type.String,
      Name: 'Address',
      Value: 'f03'
    }
  ]
}

const object = {
  Type: Type.Object,
  Name: 'ProposeParams',
  Children: {
    To: {
      Type: Type.String,
      Name: 'Address',
      Value: 'f01'              // When described
    },
    Value: {
      Type: Type.Number,
      Name: 'FilecoinNumber',
      Value: '1000'             // When described
    },
    Method: {
      Type: Type.Number,
      Name: 'MethodNum',
      Value: 2                  // When described
    },
    Params: {
      Type: Type.Bytes,
      Name: '',
      Value: 'dGVzdA=='         // When described
    }
  }
}

 */
