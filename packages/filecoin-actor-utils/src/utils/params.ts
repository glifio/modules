import cloneDeep from 'lodash.clonedeep'
import { ethers } from 'ethers'
import { actorDescriptorMap } from '../data'
import { ActorName, DataType, MethodNum, Type } from '../types'
import { describeDataType } from './generic'
import { ABI, cborToHex } from './abi'

/**
 * Returns a descriptor with values based on the provided actor name, method number and params
 * @param actorName the name of the actor on which the method was called
 * @param methodNum the number of the method that was called on the actor
 * @param msgParams the parameters that were passed to the method
 * @returns the described message params
 */
export const describeMessageParams = (
  actorName: ActorName,
  methodNum: MethodNum,
  msgParams: any
): DataType | null => {
  // Return null for falsy message params
  if (!msgParams) return null

  // Retrieve the message params descriptor
  const descriptor = actorDescriptorMap[actorName]?.Methods[methodNum]?.Param
  if (!descriptor)
    throw new Error(
      `Missing message params descriptor for: ${actorName}, method: ${methodNum}`
    )

  // Supplement the descriptor with parameter values
  const dataType = cloneDeep<DataType>(descriptor)
  describeDataType(dataType, msgParams)

  // Return the described params
  return dataType
}

// TODO: (nice to have) enable typechain artifact as a typescript generic here so the described params are typed?
export const describeFEVMMessageParams = (
  messageParams: string,
  abi: ABI
): DataType => {
  const iface = new ethers.utils.Interface(abi)
  const paramsHex = cborToHex(messageParams)
  const parsed = iface.parseTransaction({ data: paramsHex })

  // TODO: how to handle solidity structs as inputs? I believe structs are encoded as `tuple` type https://docs.soliditylang.org/en/v0.5.3/abi-spec.html#mapping-solidity-to-abi-types
  // TODO: unstandardized capitalization from built-in actors
  const children = parsed.functionFragment.inputs.reduce<
    Record<string, DataType>
  >((accum, ele) => {
    return {
      ...accum,
      [ele.name]: {
        Name: ele.name,
        Type: ele.type as Type,
        Value: parsed.args[ele.name]
      }
    }
  }, {})

  return { Type: Type.Object, Name: parsed.name, Children: children }
}
