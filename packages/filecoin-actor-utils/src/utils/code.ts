import base32Decode from 'base32-decode'
import { networkActorCodeMap, networkActorCodeMapInv } from '../data'
import { ActorCode, ActorName, LotusCID, NetworkName } from '../types'

/**
 * Resolves the actor name by providing the actor code and the network name.
 * @param actorCode the actor code which is used to resolve the actor name
 * @param networkName the network in which to search for the actor name
 * @returns the actor name when found or null when not found
 */
export const getActorName = (
  actorCode: ActorCode | LotusCID,
  networkName: NetworkName
): ActorName | null => {
  const code = typeof actorCode === 'object' ? actorCode?.['/'] : actorCode

  // Attempt the actor code lookup
  const name = networkActorCodeMapInv[networkName]?.[code] ?? null
  if (name) return name

  // Attempt to decode as v1-7 actor
  const legacyName = getLegacyActorName(code)
  if (legacyName) return legacyName

  // Return null when not found
  return null
}

/**
 * Attempts to resolve the actor name by decoding as v1-7 actor
 * @param actorCode the actor code to decode as v1-7 actor
 * @returns the actor if successful or null when not
 */
const getLegacyActorName = (actorCode: ActorCode): ActorName | null => {
  try {
    const buffer = base32Decode(actorCode.slice(1).toUpperCase(), 'RFC4648')
    const decoded = new TextDecoder('utf-8').decode(buffer.slice(4))
    return decoded.startsWith('fil/') ? decoded.split('/')[2] : null
  } catch {
    return null
  }
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
