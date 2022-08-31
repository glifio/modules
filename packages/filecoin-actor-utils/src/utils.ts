import cloneDeep from 'lodash.clonedeep'
import {
  actorDescriptorMap,
  networkActorCodeMap,
  networkActorCodeMapInv
} from './data'
import {
  ActorCode,
  ActorName,
  DataType,
  DataTypeMap,
  LotusActorState,
  NetworkName,
  Type
} from './types'

/**
 * Resolves the actor name by providing the actor code. When also providing
 * the network name, it will limit the search to that specific network.
 * @param actorCode the actor code which is used to resolve the actor name
 * @param networkName (optional) the network in which to search for the actor name
 * @returns the actor name when found or null when not found
 */
export const getActorName = (
  actorCode: ActorCode,
  networkName?: NetworkName
): ActorName | null => {
  // If "networkName" is provided, return the actor name
  // for that specific network or null when not found
  if (networkName) {
    return networkActorCodeMapInv[networkName]?.[actorCode] ?? null
  }

  // Otherwise, iterate over all the networks to find the actor name
  for (const network of Object.keys(networkActorCodeMap)) {
    const name = getActorName(actorCode, network)
    if (name !== null) return name
  }

  // Return null when the actor name is not found
  return null
}

/**
 * Resolves the actor code by providing the actor name and the network
 * name. When the network name is not provided, it defaults to "mainnet".
 * @param actorName the actor name which is used to resolve the actor code
 * @param networkName (optional) the network in which to search for the actor code, defaults to "mainnet"
 * @returns the actor code when found or null when not found
 */
export const getActorCode = (
  actorName: ActorName,
  networkName: NetworkName = 'mainnet'
): ActorCode | null => {
  // Return null when the actor code is not found
  return networkActorCodeMap[networkName]?.[actorName] ?? null
}

/**
 * Returns a descriptor with values for the provided Lotus actor state
 * @param lotusActorState the Lotus actor state as returned from StateReadState
 * @param networkName (optional) the network in which to search for the actor name
 * @returns the described actor state or null when the state is null
 */
export const describeLotusActorState = (
  lotusActorState: LotusActorState,
  networkName?: NetworkName
): DataTypeMap | null => {
  // Return null when the actor state is null
  if (lotusActorState.State === null) return null

  // Retrieve the actor name from the code
  const actorCode = lotusActorState.Code['/']
  const actorName = getActorName(actorCode, networkName)
  if (!actorName)
    throw new Error(`Failed to resolve actor name for code: ${actorCode}`)

  // Return the described actor state
  return describeActorState(actorName, lotusActorState.State)
}

/**
 * Returns a descriptor with values based on the provided actor name and state
 * @param actorName the name of the actor
 * @param actorState the actor state object
 * @returns the described actor state
 */
export const describeActorState = (
  actorName: ActorName,
  actorState: Record<string, any>
): DataTypeMap => {
  const descriptor = actorDescriptorMap[actorName].State
  const dataType = {
    Type: Type.Object,
    Name: 'State',
    Children: cloneDeep<DataTypeMap>(descriptor)
  }
  describeObject(dataType, actorState)
  return dataType.Children
}

/**
 * Adds any value to a descriptor, checks the
 * descriptor type to determine the handler
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
const describeDataType = (dataType: DataType, value: any) => {
  switch (dataType.Type) {
    case Type.Bool:
    case Type.String:
    case Type.Number:
      describeBaseValue(dataType, value)
      return
    case Type.Array:
      describeArray(dataType, value)
      return
    case Type.Object:
      describeObject(dataType, value)
      return
    default:
      throw new Error(`Unexpected descriptor DataType: ${dataType.Type}`)
  }
}

/**
 * Adds a base value (boolean, string, number) to a descriptor
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
const describeBaseValue = (
  dataType: DataType,
  value: boolean | string | number
) => {
  checkValueType(dataType, value)
  dataType.Value = value
}

/**
 * Adds the array value to an array descriptor
 * @param dataType the array descriptor to add the value to
 * @param value the value to add to the array descriptor
 */
const describeArray = (
  dataType: DataType,
  value: Array<boolean | string | number>
) => {
  const { Name, Contains } = dataType
  const valueType = typeof value

  // Check malformed descriptor
  if (!Contains) throw new Error(`Expected Contains property in array DataType`)

  // Check the value type
  if (!Array.isArray(value))
    throw new Error(`Expected array value for ${Name}, received ${valueType}`)

  // Check the value types for the array items
  // The array should not contain complex types
  switch (Contains.Type) {
    case Type.Bool:
    case Type.String:
    case Type.Number:
      value.forEach(v => checkValueType(Contains, v))
      break
    default:
      throw new Error(`Unexpected array descriptor DataType: ${dataType.Type}`)
  }

  // Add the value to the descriptor
  dataType.Value = value
}

/**
 * Adds values to the children of an object descriptor
 * @param dataType the object descriptor to add values to
 * @param value the values to add to the object descriptor
 */
const describeObject = (dataType: DataType, value: Record<string, any>) => {
  // Check malformed descriptor
  if (!dataType.Children)
    throw new Error(`Expected Children property in object DataType`)

  // Check the value type
  checkValueType(dataType, value)

  // Add values to the children of the object descriptor
  Object.entries(dataType.Children).forEach(([key, child]) => {
    describeDataType(child, value[key])
  })
}

/**
 * Can be used to check value types where the dataType.Type
 * should match typeof value (boolean, string, number, object)
 * @param dataType the DataType which the value should match with
 * @param value the value which should match with the DataType
 */
const checkValueType = (dataType: DataType, value: any) => {
  const { Type, Name } = dataType
  const valueType = typeof value
  if (valueType !== Type)
    throw new Error(`Expected ${Type} value for ${Name}, received ${valueType}`)
}
