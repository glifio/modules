import networkActorCodeMapJSON from './data/actor-codes.json'
import actorDescriptorMapJSON from './data/actor-descriptors.json'
import {
  NetworkActorCodeMap,
  ActorDescriptorMap,
  NetworkActorCodeMapInv
} from './types'

/**
 * Returns the actor code using networkActorCodeMap[networkName][actorName]
 */
export const networkActorCodeMap: NetworkActorCodeMap = networkActorCodeMapJSON

/**
 * Returns the actor name using networkActorCodeMapInv[networkName][actorCode]
 */
export const networkActorCodeMapInv: NetworkActorCodeMapInv =
  Object.fromEntries(
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

/**
 * Returns the actor descriptors with MethodNum converted to number from string.
 * This conversion is necessary because JSON does not allow numerical object keys.
 * 
 * Note: Using type assertion for `ActorDescriptorMap` here, because the JSON string
 * values of the `Type` property in `DataType` are incompatible with the `Type` enum.
 */
export const actorDescriptorMap = Object.fromEntries(
  Object.entries(actorDescriptorMapJSON).map(([actorName, actorDescriptor]) => [
    actorName,
    {
      ...actorDescriptor,
      Methods: Object.fromEntries(
        Object.entries(actorDescriptor.Methods).map(
          ([methodNum, actorMethod]) => [Number(methodNum), actorMethod]
        )
      )
    }
  ])
) as ActorDescriptorMap
