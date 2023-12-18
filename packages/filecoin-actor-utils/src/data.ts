import actorDescriptorMapJSON from './data/actor-descriptors.json'
import { ActorDescriptorMap } from './types'

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
