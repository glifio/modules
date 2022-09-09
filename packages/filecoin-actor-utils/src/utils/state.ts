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
  const descriptor = actorDescriptorMap[actorName]?.State
  if (!descriptor)
    throw new Error(`Missing actor state descriptor for: ${actorName}`)

  const dataType = {
    Type: Type.Object,
    Name: 'State',
    Children: cloneDeep<DataTypeMap>(descriptor)
  }
  describeObject(dataType, actorState)
  return dataType.Children
}
