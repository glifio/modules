import { actorDescriptorMap } from '../data'

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
