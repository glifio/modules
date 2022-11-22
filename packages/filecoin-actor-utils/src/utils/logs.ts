import { ethers } from 'ethers'
import { DataType, Type } from '../types'
import { ABI, abiParamsToDataType } from './abi'
import { describeDataType } from './generic'

export type FEVMLog = {
  address: string,
  data: string,
  topics: Array<string>
  removed: boolean
  logIndex: string
  transactionIndex: string
  transactionHash: string
  blockHash: string
  blockNumber: string
}

/**
 * Returns a descriptor with values based on the provided FEVM logs and ABI
 * @param logs the FEVM logs to describe
 * @param abi the ABI of the contract that performed this transaction
 * @returns the described FEVM logs
 */
export const describeFEVMLogs = (
  logs: Array<FEVMLog>,
  abi: ABI
): DataType | null => {
  // Return null for empty logs
  if (!logs?.length) return null

  // Sort logs by logIndex
  const sorted = logs.sort((a, b) => Number(a.logIndex) - Number(b.logIndex))

  // Parse logs to array of decribed DataTypes
  const iface = new ethers.utils.Interface(abi)
  const parsed = sorted.map(({ data, topics, logIndex }) => {
    const log = iface.parseLog({ data, topics })

    // Convert ABI inputs to descriptor
    const name = `${Number(logIndex)}: ${log.name}`
    const dataType = abiParamsToDataType(name, log.eventFragment.inputs)

    // Supplement the descriptor with log data
    describeDataType(dataType, log.args)

    // Return the described log
    return dataType
  })

  // Return the described logs as an Object DataType
  return {
    Type: Type.Object,
    Name: 'Logs',
    Children: Object.fromEntries(
      parsed.map(entry => [entry.Name, entry])
    )
  }
}
