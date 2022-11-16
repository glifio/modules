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
 * Resolves the FEVM method name by parsing the base64 params string using the ABI.
 * @param params the base64 encoded `params` of a Filecoin / Lotus message
 * @param abi the ABI of the contract that lives at the `to` address of the message
 * @returns the method name
 */
export const getFEVMMethodName = (params: string, abi: ABI): string | null => {
  if (!params || !abi) return null
  try {
    const iface = new ethers.utils.Interface(abi)
    const data = cborToHex(params)
    return iface.parseTransaction({ data }).name
  } catch {
    return null
  }
}
