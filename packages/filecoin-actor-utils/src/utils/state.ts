import cloneDeep from 'lodash.clonedeep'
import { actorDescriptorMap } from '../data'
import { ActorName, DataTypeMap, Type } from '../types'
import { describeObject } from './generic'

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
