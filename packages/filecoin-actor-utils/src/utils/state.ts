import cloneDeep from 'lodash.clonedeep'
import { actorDescriptorMap } from '../data'
import {
  ActorName,
  DataTypeMap,
  LotusActorState,
  NetworkName,
  Type
} from '../types'
import { getActorName } from './code'
import { describeObject } from './generic'

/**
 * Returns a descriptor with values for the provided Lotus actor state and network name
 * @param lotusActorState the Lotus actor state as returned from StateReadState
 * @param networkName the network in which to search for the actor name
 * @returns the described actor state or null when the state is null
 */
export const describeLotusActorState = (
  lotusActorState: LotusActorState,
  networkName: NetworkName
): DataTypeMap | null => {
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
  actorState: Record<string, any> | null
): DataTypeMap | null => {
  // Return null for falsy actor state
  if (!actorState) return null

  // Retrieve the actor state descriptor
  const descriptor = actorDescriptorMap[actorName]?.State
  if (!descriptor)
    throw new Error(`Missing actor state descriptor for: ${actorName}`)

  // Supplement the descriptor with state values
  const dataType = {
    Type: Type.Object,
    Name: 'State',
    Children: cloneDeep<DataTypeMap>(descriptor)
  }
  describeObject(dataType, actorState)

  // Return the described state
  return dataType.Children
}
