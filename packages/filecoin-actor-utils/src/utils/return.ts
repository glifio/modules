import cloneDeep from 'lodash.clonedeep'
import { actorDescriptorMap } from '../data'
import { ActorName, DataType, MethodNum } from '../types'
import { describeDataType } from './generic'

/**
 * Returns a descriptor with values based on the provided actor name, method number and return value
 * @param actorName the name of the actor on which the method was called
 * @param methodNum the number of the method that was called on the actor
 * @param msgReturn the value that was returned from the method
 * @returns the described message return value
 */
export const describeMessageReturn = (
  actorName: ActorName,
  methodNum: MethodNum,
  msgReturn: any
): DataType | null => {
  // Return null for falsy return value
  if (!msgReturn) return null

  // Retrieve the message return descriptor
  const descriptor = actorDescriptorMap[actorName]?.Methods[methodNum]?.Return
  if (!descriptor)
    throw new Error(
      `Missing message return descriptor for: ${actorName}, method: ${methodNum}`
    )

  // Supplement the descriptor with return values
  const dataType = cloneDeep<DataType>(descriptor)
  describeDataType(dataType, msgReturn)

  // Return the described return value
  return dataType
}
