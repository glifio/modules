import { ethers } from 'ethers'
import cloneDeep from 'lodash.clonedeep'
import { actorDescriptorMap } from '../data'
import { ActorName, DataType, MethodNum } from '../types'
import { ABI, cborToHex, abiParamsToDataType, abiParamToDataType } from './abi'
import { describeDataType } from './generic'

/**
 * Returns a descriptor without values for the provided actor name and method number
 * @param actorName the name of the actor on which to call the method
 * @param methodNum the number of the method to call on the actor
 * @returns the descriptor for the actor's method
 */
export const getMessageReturnDescriptor = (
  actorName: ActorName,
  methodNum: MethodNum
): DataType => {
  const descriptor = actorDescriptorMap[actorName]?.Methods[methodNum]?.Return
  if (descriptor) return descriptor
  throw new Error(
    `Missing message return descriptor for: ${actorName}, method: ${methodNum}`
  )
}

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
  const descriptor = getMessageReturnDescriptor(actorName, methodNum)

  // Supplement the descriptor with return values
  const dataType = cloneDeep<DataType>(descriptor)
  describeDataType(dataType, msgReturn)

  // Return the described return value
  return dataType
}

/**
 * Returns a descriptor with values based on the provided FEVM params, return value and ABI
 * @param params the FEVM params as a base64 encoded CBOR string
 * @param returnVal the FEVM return value as a base64 encoded CBOR string
 * @param abi the ABI of the contract that performed this transaction
 * @returns the described message return value
 */
export const describeFEVMTxReturn = (
  params: string,
  returnVal: string,
  abi: ABI
): DataType | null => {
  // Throw error for missing ABI
  if (!abi) throw new Error('Missing ABI')

  // Return null for falsy tx params or return
  if (!params || !returnVal) return null

  // Parse transaction from params
  const iface = new ethers.utils.Interface(abi)
  const data = cborToHex(params)
  const tx = iface.parseTransaction({ data })
  const { outputs } = tx.functionFragment

  // Return null for empty ABI outputs
  if (!outputs?.length) return null

  // Decode return value
  const returnHex = cborToHex(returnVal)
  const result = iface.decodeFunctionResult(tx.name, returnHex)

  // Convert ABI outputs to descriptor
  const dataType =
    outputs.length === 1
      ? abiParamToDataType(outputs[0])
      : abiParamsToDataType('Outputs', outputs)

  // Supplement the descriptor with return values
  describeDataType(dataType, outputs.length === 1 ? result[0] : result)

  // Return the described return value
  return dataType
}
