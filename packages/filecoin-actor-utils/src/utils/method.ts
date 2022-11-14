import { ethers } from 'ethers'
import { actorDescriptorMap } from '../data'
import { ABI, cborToHex } from './abi'

/**
 * Resolves the method name by providing the actor name and the method number.
 * @param actorName the actor name which is used to resolve the method name
 * @param methodNum the method number for which to resolve the method name
 * @returns the method name when found or null when not found
 */
export const getMethodName = (
  actorName: string,
  methodNum: number
): string | null =>
  actorDescriptorMap[actorName]?.Methods[methodNum]?.Name ?? null

/**
 * Resolves the method name by providing the actor name and the method number.
 * @param messageParams the `params` from a Filecoin Message type
 * @param abi the abi of the contract that lives at the `to` address of the message
 * @returns the method name
 */
export const getFEVMMethodName = (messageParams: string, abi: ABI): string => {
  const iface = new ethers.utils.Interface(abi)
  const paramsHex = cborToHex(messageParams)
  const { name } = iface.parseTransaction({ data: paramsHex })
  return name
}
