import networkActorCodeMapJSON from '../data/actor-codes.json'
import actorDescriptorMapJSON from '../data/actor-descriptors.json'
import { NetworkActorCodeMap, ActorDescriptorMap } from './types'

/**
 * Returns the actor code using networkActorCodeMap[networkName][actorName]
 */
export const networkActorCodeMap =
  networkActorCodeMapJSON as NetworkActorCodeMap

/**
 * Returns the actor name using networkActorCodeMapInv[networkName][actorCode]
 */
export const networkActorCodeMapInv = Object.fromEntries(
  Object.entries(networkActorCodeMap).map(([networkName, actorCodeMap]) => [
    networkName,
    Object.fromEntries(
      Object.entries(actorCodeMap).map(([actorName, actorCode]) => [
        actorCode,
        actorName
      ])
    )
  ])
)

export const actorDescriptorMap = actorDescriptorMapJSON as ActorDescriptorMap
