import { ethers } from 'ethers'
import cloneDeep from 'lodash.clonedeep'
import { actorDescriptorMap } from '../data'
import { ActorName, DataType, MethodNum, Type } from '../types'
import { ABI, cborToHex } from './abi'
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

export const describeFEVMMessageReturn = (
  inputParams: string,
  returnVal: string,
  abi: ABI
): DataType | null => {
  const iface = new ethers.utils.Interface(abi)
  const paramsHex = cborToHex(inputParams)
  const parsed = iface.parseTransaction({ data: paramsHex })

  const returnHex = cborToHex(returnVal)
  const result = iface.decodeFunctionResult(parsed.name as string, returnHex)

  const children = parsed.functionFragment.outputs?.reduce<
    Record<string, DataType>
  >((accum, ele, i) => {
    return {
      ...accum,
      [ele.name || `Return value ${i}`]: {
        Name: ele.name || `Return value ${i}`,
        Type: ele.type as Type,
        Value: result[i]
      }
    }
  }, {})
  return { Name: parsed.name, Type: Type.Object, Children: children }
}
