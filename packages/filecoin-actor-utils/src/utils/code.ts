import { networkActorCodeMap, networkActorCodeMapInv } from '../data'
import { ActorCode, ActorName, NetworkName } from '../types'

/**
 * Resolves the actor name by providing the actor code. When also providing
 * the network name, it will limit the search to that specific network.
 * @param actorCode the actor code which is used to resolve the actor name
 * @param networkName (optional) the network in which to search for the actor name
 * @returns the actor name when found or null when not found
 */
export const getActorName = (
  actorCode: ActorCode,
  networkName?: NetworkName
): ActorName | null => {
  // If "networkName" is provided, return the actor name
  // for that specific network or null when not found
  if (networkName) {
    return networkActorCodeMapInv[networkName]?.[actorCode] ?? null
  }

  // Otherwise, iterate over all the networks to find the actor name
  for (const network of Object.keys(networkActorCodeMap)) {
    const name = getActorName(actorCode, network)
    if (name !== null) return name
  }

  // Return null when the actor name is not found
  return null
}

/**
 * Resolves the actor code by providing the actor name and the network
 * name. When the network name is not provided, it defaults to "mainnet".
 * @param actorName the actor name which is used to resolve the actor code
 * @param networkName (optional) the network in which to search for the actor code, defaults to "mainnet"
 * @returns the actor code when found or null when not found
 */
export const getActorCode = (
  actorName: ActorName,
  networkName: NetworkName = 'mainnet'
): ActorCode | null => {
  // Return null when the actor code is not found
  return networkActorCodeMap[networkName]?.[actorName] ?? null
}
