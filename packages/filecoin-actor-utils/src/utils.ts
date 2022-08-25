import { networkActorCodeMap } from "./data"

/**
 * Resolves the actor name by providing the actor code. When also providing
 * the network name, it will limit the search to that specific network.
 * @param actorCode the actor code which is used to resolve the actor name
 * @param networkName (optional) the network in which to search for the actor name 
 * @returns the actor name when found or null when not found
 */
export const getActorName = (actorCode: string, networkName?: string): string | null => {
  
  // If "networkName" is provided, find the
  // actor name for that specific network
  if (networkName) {
    const actorCodeMap = networkActorCodeMap[networkName]
    for (const [name, code] of Object.entries(actorCodeMap)) {
      if (code === actorCode) return name
    }
  }
  
  // Otherwise, iterate over all the
  // networks to find the actor name
  else {
    for (const network of Object.keys(networkActorCodeMap)) {
      const name = getActorName(actorCode, network)
      if (name !== null) return name
    }
  }

  // Return null when the
  // actor name is not found
  return null
}

/**
 * Resolves the actor code by providing the actor name and the network
 * name. When the network name is not provided, it defaults to "mainnet".
 * @param actorName the actor name which is used to resolve the actor code
 * @param networkName (optional) the network in which to search for the actor code, defaults to "mainnet"
 * @returns the actor code when found or null when not found
 */
export const getActorCode = (actorName: string, networkName: string = 'mainnet'): string | null => {

  // Return null when the actor code is not found
  return networkActorCodeMap[networkName]?.[actorName] ?? null
}
