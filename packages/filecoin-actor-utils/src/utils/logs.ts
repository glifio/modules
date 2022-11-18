import { ethers } from 'ethers'
import { DataType, Type } from '../types'
import { ABI, abiParamsToDataType } from './abi'
import { describeDataType } from './generic'

export type RawFEVMLog = {
  topics: Array<string>
  data: string
}

export const describeFEVMLogs = (
  logs: Array<RawFEVMLog>,
  abi: ABI
): DataType[] | null => {
  if (!abi || !logs || logs.length === 0) return null

  const iface = new ethers.utils.Interface(abi)
  // create an array of DataTypes representing each emitted event
  const events = logs.map(({ topics, data }) => {
    const log = iface.parseLog({ topics, data })
    const { inputs } = log.eventFragment

    // Return a simple DataType with the event log's name for empty ABI inputs
    // although not sure you could actually emit an event with 0 inputs in solidity
    if (!inputs.length) return { Type: Type.String, Name: log.name }

    // Convert ABI inputs to descriptor
    const dataType = abiParamsToDataType(log.name, inputs)

    // Supplement the descriptor with parameter values
    describeDataType(dataType, log.args)

    // Return the described params
    return dataType
  })

  // TODO: return single Array data type?
  return events
}
