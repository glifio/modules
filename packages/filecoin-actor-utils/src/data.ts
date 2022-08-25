import networkActorCodeMapJSON from '../data/actor-codes.json'
import actorDescriptorMapJSON from '../data/actor-descriptors.json'
import { NetworkActorCodeMap, ActorDescriptorMap } from './types'

export const networkActorCodeMap = networkActorCodeMapJSON as NetworkActorCodeMap
export const actorDescriptorMap = actorDescriptorMapJSON as ActorDescriptorMap
