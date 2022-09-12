import base32Decode from 'base32-decode'
import { networkActorCodeMap, networkActorCodeMapInv } from '../data'
import { ActorCode, ActorName, LotusCID, NetworkName } from '../types'

/**
 * Resolves the actor name by providing the actor code. When also providing
 * the network name, it will limit the search to that specific network.
 * @param actorCode the actor code which is used to resolve the actor name
 * @param networkName (optional) the network in which to search for the actor name
 * @returns the actor name when found or null when not found
 */
export const getActorName = (
  actorCode: ActorCode | LotusCID,
  networkName?: NetworkName
): ActorName | null => {
  const code = typeof actorCode === 'string' ? actorCode : actorCode['/']

  // If "networkName" is provided, return the actor name
  // for that specific network or null when not found
  if (networkName) {
    return networkActorCodeMapInv[networkName]?.[code] ?? null
  }

  // Otherwise, iterate over all the networks to find the actor name
  for (const network of Object.keys(networkActorCodeMap)) {
    const name = getActorName(actorCode, network)
    if (name !== null) return name
  }

  // Decode V1-7 actor codes
  try {
    const buffer = base32Decode(actorCode.slice(1).toUpperCase(), 'RFC4648')
    const decoded = new TextDecoder('utf-8').decode(buffer.slice(4))
    if (decoded.startsWith('fil/')) return decoded.split('/')[2]
  } catch {
    // failed to decode as V1-7 actor
  }

  // Return null when the actor name is not found
  return null
}

/**
 * Resolves the actor code by providing the actor name and the network name.
 * @param actorName the actor name which is used to resolve the actor code
 * @param networkName the network in which to search for the actor code
 * @returns the actor code when found or null when not found
 */
export const getActorCode = (
  actorName: ActorName,
  networkName: NetworkName
): ActorCode | null => networkActorCodeMap[networkName]?.[actorName] ?? null
